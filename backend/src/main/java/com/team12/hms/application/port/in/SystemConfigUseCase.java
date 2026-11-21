package com.team12.hms.application.port.in;

import com.team12.hms.domain.config.SystemConfig;

import java.util.Map;

public interface SystemConfigUseCase {
    SystemConfig getConfig();
    SystemConfig updateConfig(Map<String, Object> data);
}
