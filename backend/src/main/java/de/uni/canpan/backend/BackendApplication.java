package de.uni.canpan.backend;

import de.uni.canpan.backend.config.EnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		// Load .env file before Spring starts
		EnvLoader.load();
		SpringApplication.run(BackendApplication.class, args);
	}

}
