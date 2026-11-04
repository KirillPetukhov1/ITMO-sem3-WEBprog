package itmo.web.students.config;

import jakarta.persistence.EntityManagerFactory;
import org.eclipse.persistence.config.PersistenceUnitProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.EclipseLinkJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Map;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories("itmo.web.students")
public class JpaConfig {
    @Bean
    LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        var factory = new LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(dataSource);
        factory.setPackagesToScan("itmo.web.students.student", "itmo.web.students.user", "itmo.web.students.auth");
        factory.setJpaVendorAdapter(new EclipseLinkJpaVendorAdapter());
        factory.setJpaDialect(new org.springframework.orm.jpa.vendor.EclipseLinkJpaDialect() {
            @Override
            public org.springframework.dao.DataAccessException translateExceptionIfPossible(RuntimeException ex) {
                Throwable cause = ex;
                while (cause != null) {
                    if (cause instanceof java.sql.SQLException sql) {
                        var translated = new org.springframework.jdbc.support.SQLStateSQLExceptionTranslator()
                                .translate("JPA operation", null, sql);
                        if (translated != null) return translated;
                    }
                    cause = cause.getCause();
                }
                return super.translateExceptionIfPossible(ex);
            }
        });
        factory.setJpaPropertyMap(Map.of(
                PersistenceUnitProperties.WEAVING, "false",
                PersistenceUnitProperties.TARGET_DATABASE, "org.eclipse.persistence.platform.database.PostgreSQLPlatform",
                PersistenceUnitProperties.DDL_GENERATION, "none",
                PersistenceUnitProperties.CACHE_SHARED_DEFAULT, "false",
                PersistenceUnitProperties.LOGGING_LEVEL, "WARNING"
        ));
        return factory;
    }

    @Bean
    PlatformTransactionManager transactionManager(EntityManagerFactory factory) {
        return new JpaTransactionManager(factory);
    }
}
