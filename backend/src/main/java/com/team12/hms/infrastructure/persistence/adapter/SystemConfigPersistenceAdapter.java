package com.team12.hms.infrastructure.persistence.adapter;

import com.team12.hms.application.port.out.SystemConfigPort;
import com.team12.hms.domain.config.SystemConfig;
import com.team12.hms.infrastructure.persistence.entity.SystemConfigEntity;
import com.team12.hms.infrastructure.persistence.repository.SystemConfigRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class SystemConfigPersistenceAdapter implements SystemConfigPort {

    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigPersistenceAdapter(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    @Override
    public SystemConfig getConfig() {
        SystemConfigEntity entity = systemConfigRepository.findAll().stream().findFirst().orElseGet(() -> {
            SystemConfigEntity newEntity = new SystemConfigEntity();
            newEntity.setDepositRatePercent(new BigDecimal("30.00"));
            newEntity.setServiceFeeRatePercent(new BigDecimal("5.00"));
            newEntity.setVatRatePercent(new BigDecimal("10.00"));
            return systemConfigRepository.save(newEntity);
        });

        return new SystemConfig(
                entity.getDepositRatePercent(),
                entity.getServiceFeeRatePercent(),
                entity.getVatRatePercent()
        );
    }

    @Override
    public SystemConfig saveConfig(SystemConfig config) {
        SystemConfigEntity entity = systemConfigRepository.findAll().stream().findFirst().orElseGet(SystemConfigEntity::new);
        entity.setDepositRatePercent(config.depositRatePercent());
        entity.setServiceFeeRatePercent(config.serviceFeeRatePercent());
        entity.setVatRatePercent(config.vatRatePercent());
        SystemConfigEntity saved = systemConfigRepository.save(entity);

        return new SystemConfig(
                saved.getDepositRatePercent(),
                saved.getServiceFeeRatePercent(),
                saved.getVatRatePercent()
        );
    }
}
