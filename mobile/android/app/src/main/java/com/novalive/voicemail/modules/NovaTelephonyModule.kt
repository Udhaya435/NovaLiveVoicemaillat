package com.novalive.voicemail.modules

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telecom.TelecomManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.novalive.voicemail.telecom.CallStateTracker
import com.novalive.voicemail.telecom.CarrierForwardingHelper

class NovaTelephonyModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "NovaTelephonyModule"
        private const val REQUEST_CALL_SCREENING_ROLE = 1001
        private const val REQUEST_DEFAULT_DIALER_ROLE = 1002
    }

    private var pendingPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)

        // Listen for incoming call notifications from CallScreening or InCallService
        CallStateTracker.setIncomingCallListener { phoneNumber, displayName ->
            val params = Arguments.createMap().apply {
                putString("phoneNumber", phoneNumber)
                putString("displayName", displayName ?: "Unknown Caller")
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            sendEvent("onIncomingCall", params)
        }
    }

    override fun getName(): String = NAME

    private fun sendEvent(eventName: String, params: WritableMap?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun requestCallScreeningRole(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Current activity is null")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = reactContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
            if (roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                promise.resolve(true)
                return
            }

            pendingPromise = promise
            val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
            activity.startActivityForResult(intent, REQUEST_CALL_SCREENING_ROLE)
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun requestDefaultDialerRole(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Current activity is null")
            return
        }

        pendingPromise = promise

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = reactContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
            if (roleManager.isRoleHeld(RoleManager.ROLE_DIALER)) {
                promise.resolve(true)
                return
            }
            val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER)
            activity.startActivityForResult(intent, REQUEST_DEFAULT_DIALER_ROLE)
        } else {
            val telecomManager = reactContext.getSystemService(Context.TELECOM_SERVICE) as TelecomManager
            val intent = Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER).apply {
                putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, reactContext.packageName)
            }
            activity.startActivityForResult(intent, REQUEST_DEFAULT_DIALER_ROLE)
        }
    }

    @ReactMethod
    fun isCallScreeningRoleHeld(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = reactContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
            promise.resolve(roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING))
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun isDefaultDialerHeld(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = reactContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
            promise.resolve(roleManager.isRoleHeld(RoleManager.ROLE_DIALER))
        } else {
            val telecomManager = reactContext.getSystemService(Context.TELECOM_SERVICE) as TelecomManager
            promise.resolve(telecomManager.defaultDialerPackage == reactContext.packageName)
        }
    }

    @ReactMethod
    fun activateCarrierForwarding(type: String, targetNumber: String, ringSeconds: Int, promise: Promise) {
        try {
            val mmi = CarrierForwardingHelper.buildMmiCode(type, targetNumber, ringSeconds)
            val success = CarrierForwardingHelper.dialMmiCode(reactContext, mmi)
            val result = Arguments.createMap().apply {
                putBoolean("success", success)
                putString("mmiCode", mmi)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("FORWARDING_ERROR", e.message)
        }
    }

    @ReactMethod
    fun disableCarrierForwarding(promise: Promise) {
        try {
            val mmi = "##002#"
            val success = CarrierForwardingHelper.dialMmiCode(reactContext, mmi)
            val result = Arguments.createMap().apply {
                putBoolean("success", success)
                putString("mmiCode", mmi)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("FORWARDING_ERROR", e.message)
        }
    }

    @ReactMethod
    fun setSilenceUnknownCallers(silence: Boolean) {
        CallStateTracker.setSilenceUnknown(silence)
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CALL_SCREENING_ROLE || requestCode == REQUEST_DEFAULT_DIALER_ROLE) {
            val isSuccess = resultCode == Activity.RESULT_OK
            pendingPromise?.resolve(isSuccess)
            pendingPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
