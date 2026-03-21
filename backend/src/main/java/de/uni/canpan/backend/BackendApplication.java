package de.uni.canpan.backend;

import de.uni.canpan.backend.config.EnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BackendApplication {

	public static void main(String[] args) {
		// Load .env file before Spring starts
		EnvLoader.load();
		SpringApplication.run(BackendApplication.class, args);
	}

}
