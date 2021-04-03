package com.flair.bi;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import java.io.File;
import java.time.Duration;

@Slf4j
public class TestContainersInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        startComposeTestContainer();
    }

    private void startComposeTestContainer() {
        log.info("TestContainerInitializer: Container starting");
        DockerComposeContainer container = new DockerComposeContainer(new File("src/test/resources/compose-test2.yml"))
                .withPull(true)
//                .withTailChildContainers(true)
                .waitingFor("test-flair-pgsql_1",
                        Wait.forLogMessage(".+database system is ready to accept connections.*\\n", 1)
                                .withStartupTimeout(Duration.ofMinutes(1)))
                ;
        log.info("Container starting");
        container.start();
        log.info("Container started");
    }

}