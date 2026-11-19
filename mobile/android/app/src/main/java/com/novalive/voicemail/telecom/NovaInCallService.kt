package com.novalive.voicemail.telecom

import android.content.Intent
import android.telecom.Call
import android.telecom.InCallService
import android.util.Log

/**
 * NovaInCallService
 * 
 * Bound when Nova is the active Default Dialer.
 * Manages active call lifecycle: Answer, Decline, and Ongoing call state.
 */
class NovaInCallService : InCallService() {

    companion object {
        private const val TAG = "NovaInCallService"
        var activeCall: Call? = null
    }

    private val callCallback = object : Call.Callback() {
        override fun onStateChanged(call: Call, state: Int) {
            super.onStateChanged(call, state)
            Log.d(TAG, "Call state changed to $state")
            if (state == Call.STATE_DISCONNECTED) {
                activeCall = null
            }
        }
    }

    override fun onCallAdded(call: Call) {
        super.onCallAdded(call)
        Log.i(TAG, "Incoming or outgoing call added: ${call.details}")
        activeCall = call
        call.registerCallback(callCallback)

        val handle = call.details.handle
        val phoneNumber = handle?.schemeSpecificPart ?: "Unknown"
        val displayName = call.details.callerDisplayName

        CallStateTracker.onCallReceived(phoneNumber, displayName)
    }

    override fun onCallRemoved(call: Call) {
        super.onCallRemoved(call)
        Log.i(TAG, "Call removed")
        call.unregisterCallback(callCallback)
        if (activeCall == call) {
            activeCall = null
        }
    }

    /**
     * Answer the active call
     */
    fun answerCall() {
        activeCall?.answer(0)
    }

    /**
     * Decline call and send to carrier voicemail / busy
     */
    fun declineCall() {
        activeCall?.reject(Call.REJECT_REASON_DECLINED)
    }
}
