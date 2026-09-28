package fr.yummycomponents.caisse;

import javax.sql.DataSource;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.DatabasePopulatorUtils;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

/**
 * Création / réinitialisation de la base SQLite à partir de db/schema.sql et db/data.sql.
 */
@Component
public class Database implements ApplicationRunner {

    private final DataSource dataSource;
    private final JdbcTemplate jdbc;

    public Database(DataSource dataSource, JdbcTemplate jdbc) {
        this.dataSource = dataSource;
        this.jdbc = jdbc;
    }

    /** Au démarrage du serveur : si la base est vide, on la crée avec les données de départ. */
    @Override
    public void run(ApplicationArguments args) {
        Integer tables = jdbc.queryForObject(
                "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'products'", Integer.class);
        if (tables == null || tables == 0) {
            reset();
        }
    }

    /** Supprime toutes les tables puis les recrée avec les données de départ. */
    public synchronized void reset() {
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                new ClassPathResource("db/schema.sql"),
                new ClassPathResource("db/data.sql"));
        populator.setSqlScriptEncoding("UTF-8");
        DatabasePopulatorUtils.execute(populator, dataSource);
    }
}
