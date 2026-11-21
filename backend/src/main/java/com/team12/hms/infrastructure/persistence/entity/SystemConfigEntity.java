package com.team12.hms.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "system_config")
public class SystemConfigEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "deposit_rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal depositRatePercent = new BigDecimal("30.00");

    @Column(name = "service_fee_rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal serviceFeeRatePercent = new BigDecimal("5.00");

    @Column(name = "vat_rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal vatRatePercent = new BigDecimal("10.00");

    public SystemConfigEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public BigDecimal getDepositRatePercent() { return depositRatePercent; }
    public void setDepositRatePercent(BigDecimal depositRatePercent) { this.depositRatePercent = depositRatePercent; }
    public BigDecimal getServiceFeeRatePercent() { return serviceFeeRatePercent; }
    public void setServiceFeeRatePercent(BigDecimal serviceFeeRatePercent) { this.serviceFeeRatePercent = serviceFeeRatePercent; }
    public BigDecimal getVatRatePercent() { return vatRatePercent; }
    public void setVatRatePercent(BigDecimal vatRatePercent) { this.vatRatePercent = vatRatePercent; }
}
