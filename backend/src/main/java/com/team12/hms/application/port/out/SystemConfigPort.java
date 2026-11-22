package com.team12.hms.application.port.out;

import com.team12.hms.domain.config.SystemConfig;

public interface SystemConfigPort {
    SystemConfig getConfig();
    SystemConfig saveConfig(SystemConfig config);
}
