package de.uni.canpan.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.File;

public class EnvLoader {
    
    public static void load() {
        String baseDir = System.getProperty("user.dir");
        
        Dotenv dotenv = Dotenv.configure()
            .ignoreIfMissing()
            .directory(baseDir)
            .filename(".env")
            .load();

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
    }
}
