package com.team12.hms.application.service;

import com.team12.hms.application.port.in.SystemConfigUseCase;
import com.team12.hms.application.port.out.SystemConfigPort;
import com.team12.hms.domain.config.SystemConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class SystemConfigAppService implements SystemConfigUseCase {

    private final SystemConfigPort systemConfigPort;

    public SystemConfigAppService(SystemConfigPort systemConfigPort) {
        this.systemConfigPort = systemConfigPort;
    }

    @Override
    public SystemConfig getConfig() {
        return systemConfigPort.getConfig();
    }

    @Override
    @Transactional
    public SystemConfig updateConfig(Map<String, Object> data) {
        SystemConfig current = getConfig();
        BigDecimal deposit = current.depositRatePercent();
        BigDecimal service = current.serviceFeeRatePercent();
        BigDecimal vat = current.vatRatePercent();

        if (data.containsKey("depositRatePercent")) {
            deposit = new BigDecimal(data.get("depositRatePercent").toString());
        }
        if (data.containsKey("serviceFeeRatePercent")) {
            service = new BigDecimal(data.get("serviceFeeRatePercent").toString());
        }
        if (data.containsKey("vatRatePercent")) {
            vat = new BigDecimal(data.get("vatRatePercent").toString());
        }

        SystemConfig updated = new SystemConfig(deposit, service, vat);
        return systemConfigPort.saveConfig(updated);
    }
}
