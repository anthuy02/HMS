package com.team12.hms.infrastructure.common;

import com.team12.hms.domain.common.ClockProvider;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class SystemClockProvider implements ClockProvider {
    @Override
    public Instant now() {
        return Instant.now();
    }
}
