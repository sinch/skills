package com.sinch.rtc.vvc.reference.app.utils.jwt

/**
 * JWTFetcher is responsible of creating JWT tokens based on application key and user id.
 */
interface JWTFetcher {

    /**
     * Creates JWT token asynchronously based on application key and userId.
     * @param applicationKey Application key copied from Sinch Portal dashboard.
     * @param userId Id of the logged in user.
     * @param callback Callback invoked after generation of the JWT token (String parameter)
     */
    fun acquireJWT(applicationKey: String, userId: String, callback: (String) -> Unit)

}