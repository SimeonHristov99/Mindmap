/**
 * This is an emuration of all the states a login or singup state machine
 * can be in.
 */
export enum State {
    NO_ATTEMPT,
    FAIL_EMAIL,
    FAIL_EMAIL_TAKEN,
    SUCCESS,
    FAIL_PASSWORD
}
