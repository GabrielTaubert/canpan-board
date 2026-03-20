package de.uni.canpan.backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleForbiddenException_returns403WithMessage() {
        var response = handler.handleForbiddenException(new ForbiddenException("access denied"));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().message()).isEqualTo("access denied");
        assertThat(response.getBody().status()).isEqualTo(403);
        assertThat(response.getBody().timestamp()).isNotNull();
    }

    @Test
    void handleIllegalArgumentException_returns400WithMessage() {
        var response = handler.handleIllegalArgumentException(new IllegalArgumentException("bad input"));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().message()).isEqualTo("bad input");
        assertThat(response.getBody().status()).isEqualTo(400);
    }

    @Test
    void handleAuthException_returns401WithMessage() {
        var response = handler.handleAuthException(new AuthException("unauthorized", "token expired"));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().message()).isEqualTo("token expired");
        assertThat(response.getBody().status()).isEqualTo(401);
    }

    @Test
    void handleResourceNotFoundException_returns404WithMessage() {
        var response = handler.handleResourceNotFound(new ResourceNotFoundException("Project", "id", "abc"));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().message()).contains("Project");
        assertThat(response.getBody().status()).isEqualTo(404);
    }

    @Test
    void handleGenericException_returns500() {
        var response = handler.handleGenericException(new RuntimeException("boom"));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred");
        assertThat(response.getBody().status()).isEqualTo(500);
    }

    @Test
    void handleValidationExceptions_returns400WithFieldErrors() {
        var bindingResult = new BeanPropertyBindingResult(new Object(), "obj");
        bindingResult.addError(new FieldError("obj", "email", "must not be blank"));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        var response = handler.handleValidationExceptions(ex);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().errors()).containsEntry("email", "must not be blank");
        assertThat(response.getBody().message()).isEqualTo("Validation failed");
    }
}
