package com.dukanai.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Automatically repairs Flyway's schema history before each migration run.
 * This clears any "failed" migration markers (e.g. V5 that failed due to a SQL syntax bug)
 * so the corrected migration can re-run cleanly on the next startup.
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy repairThenMigrate() {
        return flyway -> {
            flyway.repair();   // clears failed markers from flyway_schema_history
            flyway.migrate();  // then runs any pending migrations
        };
    }
}
