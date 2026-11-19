package com.novalive.voicemail.telecom

import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import androidx.annotation.RequiresApi

/**
 * NovaCallScreeningService
 * 
 * Implements Android Telecom's official CallScreeningService.
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * - Operates strictly within Android's mandatory screening timeout (typically ~5 seconds).
 * - Identifies caller information when available via Call.Details.
 * - DOES NOT claim to record or intercept caller audio (which Android strictly prohibits for third-party apps).
 * - Routes call decision: allow normally or silently drop spam per user configuration.
 */
@RequiresApi(Build.VERSION_CODES.Q)
class NovaCallScreeningService : CallScreeningService() {

    companion object {
        private const val TAG = "NovaCallScreening"
    }

    override fun onScreenCall(callDetails: Call.Details) {
        val handle = callDetails.handle
        val rawPhoneNumber = handle?.schemeSpecificPart ?: "Unknown"
        val callerDisplayName = callDetails.callerDisplayName

        Log.i(TAG, "Screening incoming call from $rawPhoneNumber ($callerDisplayName)")

        // Notify app state tracker
        CallStateTracker.onCallReceived(rawPhoneNumber, callerDisplayName)

        // Determine screening response
        val responseBuilder = CallResponse.Builder()

        // Check if silence unknown or spam rule applies
        val shouldSilence = CallStateTracker.shouldSilenceUnknown() && rawPhoneNumber == "Unknown"

        if (shouldSilence) {
            responseBuilder
                .setDisallowCall(false)
                .setRejectCall(false)
                .setSilenceCall(true)
                .setSkipCallLog(false)
                .setSkipNotification(true)
            Log.d(TAG, "Silenced unknown caller per user setting")
        } else {
            // Default: Allow call normally so phone rings and user can answer or let it forward to voicemail
            responseBuilder
                .setDisallowCall(false)
                .setRejectCall(false)
                .setSilenceCall(false)
                .setSkipCallLog(false)
                .setSkipNotification(false)
        }

        // Must respond before timeout
        respondToCall(callDetails, responseBuilder.build())
    }
}
