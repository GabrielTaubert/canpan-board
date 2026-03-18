package de.uni.canpan.backend.exception;

public class AuthException extends RuntimeException {

    private final String error;

    public AuthException(String message) {
        super(message);
        this.error = message;
    }

    public AuthException(String message, String error) {
        super(message);
        this.error = error;
    }

    public String getError() {
        return error;
    }
}
