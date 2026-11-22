package com.team12.hms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class HmsApplication {
    public static void main(String[] args) {
        // BR-06: Đặt múi giờ nghiệp vụ chuẩn Asia/Ho_Chi_Minh (UTC+7)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(HmsApplication.class, args);
    }
}
