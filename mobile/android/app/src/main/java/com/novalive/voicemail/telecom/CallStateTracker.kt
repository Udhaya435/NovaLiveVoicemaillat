package com.novalive.voicemail.telecom

object CallStateTracker {
    private var silenceUnknownCallers = false
    private var listener: ((phoneNumber: String, displayName: String?) -> Unit)? = null

    fun setSilenceUnknown(silence: Boolean) {
        silenceUnknownCallers = silence
    }

    fun shouldSilenceUnknown(): Boolean {
        return silenceUnknownCallers
    }

    fun setIncomingCallListener(l: ((phoneNumber: String, displayName: String?) -> Unit)?) {
        this.listener = l
    }

    fun onCallReceived(phoneNumber: String, displayName: String?) {
        listener?.invoke(phoneNumber, displayName)
    }
}
