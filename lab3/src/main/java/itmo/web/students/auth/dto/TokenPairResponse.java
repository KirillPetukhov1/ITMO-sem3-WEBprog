package itmo.web.students.auth.dto;

public record TokenPairResponse(String accessToken, String refreshToken, String tokenType, long expiresIn) {
}
