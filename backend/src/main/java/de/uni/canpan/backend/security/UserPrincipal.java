package de.uni.canpan.backend.security;

import java.security.Principal;

public class UserPrincipal implements Principal {

    private final String userId;
    private final String email;

    public UserPrincipal(String userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    @Override
    public String getName() {
        return userId;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}
