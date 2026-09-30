// This file is compiled TOGETHER with FunticoPhaserSDK.ts into one module by build/build.mjs.
// The generator strips every import declaration below, so they exist only for editor support
// (go-to-definition / type checking when this file is opened on its own).
import {
  FunticoSDK,
  FunticoConfig,
  UserData,
  BalanceResponse,
  CampaignLevelsViewModel,
  CampaignMetrics,
  CampaignCompletionResult
} from "../upstream/phaser/FunticoPhaserSDK";

/** A registered listener: the callback plus the `this` it is invoked with, and whether it fires once. */
interface FunticoClientListener {
  fn: (...args: any[]) => void;
  context: any;
  once: boolean;
}

/**
 * Framework-agnostic event wrapper around FunticoSDK - the plain-JavaScript equivalent of the
 * Phaser SDK's FunticoPhaserPlugin. Works in browsers, Telegram Mini App webviews and Node
 * (it uses no DOM EventTarget/CustomEvent).
 *
 * Every method calls the same FunticoSDK method and emits the same event, with the same payload
 * and at the same point, as FunticoPhaserPlugin does. Event names and values are identical to
 * FunticoPhaserPlugin.EVENTS, so code can be moved between the two SDKs unchanged.
 *
 * Deliberate differences from FunticoPhaserPlugin:
 *  - init() does NOT swallow errors. If FunticoSDK.Initialize rejects (including config
 *    validation - "Invalid FunticoConfig: ..."), init() rejects with that same error and emits
 *    nothing. The Phaser plugin logs and resolves instead, which hides a broken config.
 *  - Listener isolation. Events are dispatched synchronously, in registration order, over a
 *    snapshot of the listener list: a listener added during a dispatch first runs on the next
 *    emit; an on() listener removed during a dispatch still runs this once, while a pending
 *    once() listener removed during it - or by off() at any time before it fires - never runs;
 *    a once() listener never fires more than once. A listener that throws
 *    is reported with console.error and neither stops the remaining listeners nor makes the SDK
 *    call reject.
 *
 * Separate FunticoClient instances have separate listener sets but share the singleton SDK
 * (FunticoSDK.Instance).
 *
 * @example
 * const funtico = new FunticoClient();
 * funtico.on(FunticoClient.EVENTS.BALANCE_UPDATED, (balance) => render(balance));
 * await funtico.init({
 *   env: FunticoEnvironment.STAGING, // any value other than STAGING selects the production hosts
 *   publicGameKey: 'your-public-key',
 *   privateGameKey: 'your-private-key',
 *   userToken
 * });
 */
export class FunticoClient {
  /** Event names. Keys and values are identical to FunticoPhaserPlugin.EVENTS. */
  public static readonly EVENTS = {
    INITIALIZED: 'funtico_initialized',
    AUTHENTICATED: 'funtico_authenticated',
    USER_DATA_UPDATED: 'funtico_user_updated',
    BALANCE_UPDATED: 'funtico_balance_updated',
    CAMPAIGN_PROGRESS_UPDATED: 'funtico_campaign_progress_updated'
  };

  /** The SDK singleton (always FunticoSDK.Instance). Use it for everything that has no event. */
  public readonly sdk: FunticoSDK;

  private readonly listeners: Map<string, FunticoClientListener[]> = new Map();

  constructor() {
    this.sdk = FunticoSDK.Instance;
  }

  // ---------------------------------------------------------------------------------------------
  // Event emitter
  // ---------------------------------------------------------------------------------------------

  /** Registers a listener for an event. `context` is used as `this` when the listener is called. */
  public on(event: string, listener: (...args: any[]) => void, context?: any): this {
    return this.addListener(event, listener, context, false);
  }

  /** Registers a listener that is removed right before its first invocation. */
  public once(event: string, listener: (...args: any[]) => void, context?: any): this {
    return this.addListener(event, listener, context, true);
  }

  /**
   * Removes listeners. Without `listener`, removes every listener of `event`. With `listener`,
   * removes the registrations of that function whose context matches (when `context` is omitted
   * it matches registrations made without a context).
   */
  public off(event: string, listener?: (...args: any[]) => void, context?: any): this {
    if (!listener) {
      this.listeners.delete(event);
      return this;
    }
    const list = this.listeners.get(event);
    if (!list) return this;
    const remaining = list.filter(l => !(l.fn === listener && l.context === context));
    if (remaining.length > 0) {
      this.listeners.set(event, remaining);
    } else {
      this.listeners.delete(event);
    }
    return this;
  }

  private addListener(event: string, fn: (...args: any[]) => void, context: any, once: boolean): this {
    if (typeof fn !== 'function') {
      throw new TypeError(`[FunticoClient] listener for "${event}" must be a function`);
    }
    const list = this.listeners.get(event);
    const entry: FunticoClientListener = { fn, context, once };
    if (list) {
      list.push(entry);
    } else {
      this.listeners.set(event, [entry]);
    }
    return this;
  }

  /** Removes one exact registration. Returns false if it was no longer registered. */
  private removeEntry(event: string, entry: FunticoClientListener): boolean {
    const list = this.listeners.get(event);
    const index = list ? list.indexOf(entry) : -1;
    if (!list || index < 0) return false;
    list.splice(index, 1);
    if (list.length === 0) this.listeners.delete(event);
    return true;
  }

  /**
   * Synchronous dispatch over a snapshot of the current listeners. A throwing listener is logged
   * and skipped so it cannot break the other listeners or the SDK call that triggered the event.
   */
  private emit(event: string, ...args: any[]): void {
    const list = this.listeners.get(event);
    if (!list || list.length === 0) return;

    for (const l of list.slice()) {
      if (l.once) {
        // Removed before invocation, so a re-entrant emit of the same event cannot fire it twice.
        // Only this registration is removed (by identity), not other on()/once() calls of the same fn.
        if (!this.removeEntry(event, l)) continue; // already removed by an earlier listener in this dispatch
      }
      try {
        l.fn.apply(l.context, args);
      } catch (err) {
        console.error(`[FunticoClient] listener for "${event}" threw:`, err);
      }
    }
  }

  // ---------------------------------------------------------------------------------------------
  // SDK calls that broadcast their result (same events/payloads as FunticoPhaserPlugin)
  // ---------------------------------------------------------------------------------------------

  /**
   * Initializes the SDK (FunticoSDK.Initialize), then emits INITIALIZED and, if the SDK holds a
   * JWT afterwards, AUTHENTICATED with that JWT. Normally that is because config.userToken was
   * given and exchanged. Initialize never clears a JWT from an earlier login()/init() (the SDK is
   * a shared singleton), so re-initializing without userToken - even through a new FunticoClient -
   * still emits AUTHENTICATED with the old JWT; it is not a sign-out. Same as FunticoPhaserPlugin.init.
   *
   * Unlike FunticoPhaserPlugin.init, errors are NOT swallowed: an invalid config or a failed
   * authentication rejects this promise with the original error and nothing is emitted.
   */
  public async init(config: FunticoConfig): Promise<void> {
    await this.sdk.Initialize(config);
    this.emit(FunticoClient.EVENTS.INITIALIZED);

    if (this.sdk.getUserToken()) {
      this.emit(FunticoClient.EVENTS.AUTHENTICATED, this.sdk.getUserToken());
    }
  }

  /** Exchanges a platform token for the game JWT (FunticoSDK.Authentication), then emits AUTHENTICATED(jwt). */
  public async login(platformToken: string): Promise<any> {
    const result = await this.sdk.Authentication(platformToken);
    this.emit(FunticoClient.EVENTS.AUTHENTICATED, this.sdk.getUserToken());
    return result;
  }

  /** Fetches the user profile (FunticoSDK.GetUserData), then emits USER_DATA_UPDATED(userData). */
  public async refreshUserData(useCache = false): Promise<UserData> {
    const data = await this.sdk.GetUserData(useCache);
    this.emit(FunticoClient.EVENTS.USER_DATA_UPDATED, data);
    return data;
  }

  /** Fetches the balance (FunticoSDK.GetBalance), then emits BALANCE_UPDATED(balance). */
  public async refreshBalance(useCache = false): Promise<BalanceResponse> {
    const balance = await this.sdk.GetBalance(useCache);
    this.emit(FunticoClient.EVENTS.BALANCE_UPDATED, balance);
    return balance;
  }

  /**
   * Fetches the campaign level list (FunticoSDK.GetCampaignLevels) and broadcasts it, so a
   * level-select screen can rebind without owning the request. Note the event payload differs
   * from completeCampaignLevel's: this emits the CampaignLevelsViewModel, that emits the
   * CampaignCompletionResult.
   */
  public async refreshCampaign(useCache = false): Promise<CampaignLevelsViewModel> {
    const campaign = await this.sdk.GetCampaignLevels(useCache);
    this.emit(FunticoClient.EVENTS.CAMPAIGN_PROGRESS_UPDATED, campaign);
    return campaign;
  }

  /**
   * Submits a finished campaign run (FunticoSDK.CompleteCampaignLevel) and broadcasts the graded
   * outcome as CAMPAIGN_PROGRESS_UPDATED(CampaignCompletionResult).
   */
  public async completeCampaignLevel(metrics: CampaignMetrics): Promise<CampaignCompletionResult> {
    const result = await this.sdk.CompleteCampaignLevel(metrics);
    this.emit(FunticoClient.EVENTS.CAMPAIGN_PROGRESS_UPDATED, result);
    return result;
  }
}
