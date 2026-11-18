package itmo.web.students.auth.dto;

public record BrowserTokenResponse(String accessToken, String tokenType, long expiresIn) {
    public static BrowserTokenResponse from(TokenPairResponse pair) {
        return new BrowserTokenResponse(pair.accessToken(), pair.tokenType(), pair.expiresIn());
    }
}
