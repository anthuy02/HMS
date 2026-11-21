package com.team12.hms.infrastructure.security;

import com.team12.hms.application.port.out.AuthTokenPort;
import com.team12.hms.application.port.out.UserPort;
import com.team12.hms.domain.auth.AuthToken;
import com.team12.hms.domain.auth.User;
import com.team12.hms.domain.common.ClockProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class TokenAuthFilter extends OncePerRequestFilter {

    private final AuthTokenPort authTokenPort;
    private final UserPort userPort;
    private final ClockProvider clockProvider;

    public TokenAuthFilter(AuthTokenPort authTokenPort, UserPort userPort, ClockProvider clockProvider) {
        this.authTokenPort = authTokenPort;
        this.userPort = userPort;
        this.clockProvider = clockProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String tokenStr = authHeader.substring(7).trim();
            try {
                UUID token = UUID.fromString(tokenStr);
                Optional<AuthToken> tokenOpt = authTokenPort.findValidToken(token, clockProvider.now());

                if (tokenOpt.isPresent()) {
                    AuthToken authToken = tokenOpt.get();
                    Optional<User> userOpt = userPort.findById(authToken.getUserId());

                    if (userOpt.isPresent() && userOpt.get().isActive()) {
                        User user = userOpt.get();
                        String role = user.getRole().name();
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(user, null, List.of(authority));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (IllegalArgumentException ignored) {
                // Invalid UUID format - ignore and continue without authentication
            }
        }

        filterChain.doFilter(request, response);
    }
}
