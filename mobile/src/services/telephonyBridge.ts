import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NovaTelephonyModule } = NativeModules;

const isAndroid = Platform.OS === 'android';
const hasNativeModule = isAndroid && !!NovaTelephonyModule;

const eventEmitter = hasNativeModule ? new NativeEventEmitter(NovaTelephonyModule) : null;

export interface IncomingCallEvent {
  phoneNumber: string;
  displayName: string;
  timestamp: number;
}

export const TelephonyBridge = {
  /**
   * Request Android Call Screening Role (RoleManager.ROLE_CALL_SCREENING)
   */
  requestCallScreeningRole: async (): Promise<boolean> => {
    if (!hasNativeModule) {
      console.warn('[TelephonyBridge] Native module unavailable on this platform/mode');
      return true;
    }
    return NovaTelephonyModule.requestCallScreeningRole();
  },

  /**
   * Request Default Dialer Role (RoleManager.ROLE_DIALER)
   */
  requestDefaultDialerRole: async (): Promise<boolean> => {
    if (!hasNativeModule) {
      return true;
    }
    return NovaTelephonyModule.requestDefaultDialerRole();
  },

  /**
   * Check if Call Screening role is currently held
   */
  isCallScreeningActive: async (): Promise<boolean> => {
    if (!hasNativeModule) return true;
    return NovaTelephonyModule.isCallScreeningRoleHeld();
  },

  /**
   * Check if Default Dialer role is currently held
   */
  isDefaultDialerActive: async (): Promise<boolean> => {
    if (!hasNativeModule) return false;
    return NovaTelephonyModule.isDefaultDialerHeld();
  },

  /**
   * Activate carrier conditional call forwarding using standard MMI code
   * Types: "no_answer", "busy", "unreachable", "all_conditional"
   */
  activateCarrierForwarding: async (type: string, targetNumber: string, ringSeconds = 20): Promise<{ success: boolean; mmiCode: string }> => {
    if (!hasNativeModule) {
      return { success: true, mmiCode: `*61*${targetNumber}**${ringSeconds}#` };
    }
    return NovaTelephonyModule.activateCarrierForwarding(type, targetNumber, ringSeconds);
  },

  /**
   * Disable carrier call forwarding (##002#)
   */
  disableCarrierForwarding: async (): Promise<{ success: boolean; mmiCode: string }> => {
    if (!hasNativeModule) {
      return { success: true, mmiCode: '##002#' };
    }
    return NovaTelephonyModule.disableCarrierForwarding();
  },

  /**
   * Configure silence unknown callers rule in CallScreeningService
   */
  setSilenceUnknownCallers: (silence: boolean) => {
    if (hasNativeModule) {
      NovaTelephonyModule.setSilenceUnknownCallers(silence);
    }
  },

  /**
   * Subscribe to incoming call events detected by CallScreeningService / InCallService
   */
  onIncomingCall: (callback: (event: IncomingCallEvent) => void) => {
    if (!eventEmitter) return () => {};
    const subscription = eventEmitter.addListener('onIncomingCall', callback);
    return () => subscription.remove();
  }
};
