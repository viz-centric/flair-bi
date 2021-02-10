package com.flair.bi.aop.logging;

import com.flair.bi.config.Constants;
import com.flair.bi.exception.UniqueConstraintsException;
import com.flair.bi.web.rest.errors.ErrorConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

import java.util.Arrays;

/**
 * Aspect for logging execution of service and repository Spring components.
 * <p>
 * By default, it only runs with the "dev" profile.
 */
//@Aspect
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

	private final Environment env;

	/**
	 * Pointcut that matches all repositories, services and Web REST endpoints.
	 */
	@Pointcut("within(com.flair.bi.repository..*) || within(com.flair.bi.service..*) || within(com.flair.bi.web.rest..*)")
	public void loggingPointcut() {
		// Method is empty as this is just a Poincut, the implementations are in the
		// advices.
	}

	/**
	 * Advice that logs methods throwing exceptions.
	 *
	 * @param joinPoint join point
	 * @param e         error
	 */
	@AfterThrowing(pointcut = "loggingPointcut()", throwing = "e")
	public void logAfterThrowing(JoinPoint joinPoint, Throwable e) {
		if (env.acceptsProfiles(Profiles.of(Constants.SPRING_PROFILE_DEVELOPMENT))) {
			log.error("Exception in {}.{}() with cause = \'{}\' and exception = \'{}\'",
					joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName(),
					e.getCause() != null ? e.getCause() : "NULL", e.getMessage(), e);

		} else {
			log.error("Exception in {}.{}() with cause = {}", joinPoint.getSignature().getDeclaringTypeName(),
					joinPoint.getSignature().getName(), e.getCause() != null ? e.getCause() : "NULL");
		}
		if (e.getMessage() != null && e.getMessage().contains("name_unique]")) {
			throw new UniqueConstraintsException(ErrorConstants.UNIQUE_CONSTRAINTS_ERROR, e);
		}
	}

	/**
	 * Advice that logs when a method is entered and exited.
	 * 
	 * @param joinPoint join point
	 * @throws Throwable error
	 * @return object
	 */
	@Around("loggingPointcut()")
	public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
		if (log.isDebugEnabled()) {
//			log.debug("Enter: {}.{}() with argument[s] = {}", joinPoint.getSignature().getDeclaringTypeName(),
//					joinPoint.getSignature().getName(), Arrays.toString(joinPoint.getArgs()));
		}
		try {
			Object result = joinPoint.proceed();
			if (log.isDebugEnabled()) {
//				log.debug("Exit: {}.{}() with result = {}", joinPoint.getSignature().getDeclaringTypeName(),
//						joinPoint.getSignature().getName(), result);
			}
			return result;
		} catch (IllegalArgumentException e) {
			log.error("Illegal argument: {} in {}.{}()", Arrays.toString(joinPoint.getArgs()),
					joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());

			throw e;
		}
	}
}
