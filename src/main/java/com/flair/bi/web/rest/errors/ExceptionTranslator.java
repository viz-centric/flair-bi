package com.flair.bi.web.rest.errors;

import com.flair.bi.exception.UniqueConstraintsException;
import com.flair.bi.service.ViewExportImportException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity.BodyBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

/**
 * Controller advice to translate the server side exceptions to client-friendly
 * json structures.
 */
@ControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class ExceptionTranslator {

	@ExceptionHandler(ViewExportImportException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorVM processViewExportImportException(ViewExportImportException ex) {
		log.debug("processViewExportImportException", ex);
		return new ErrorVM(ErrorConstants.ERR_VIEW_IMPORT_EXPORT_ERROR, ex.getMessage(),
				List.of(new FieldErrorVM("", ex.getField(), "", ex.getKind().name().toLowerCase() + "." + ex.getType().name().toLowerCase())));
	}

	@ExceptionHandler(ConcurrencyFailureException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	@ResponseBody
	public ErrorVM processConcurencyError(ConcurrencyFailureException ex) {
		log.debug("processConcurencyError", ex);
		return new ErrorVM(ErrorConstants.ERR_CONCURRENCY_FAILURE);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorVM processValidationError(MethodArgumentNotValidException ex) {
		log.debug("processValidationError", ex);
		BindingResult result = ex.getBindingResult();
		List<FieldError> fieldErrors = result.getFieldErrors();

		return processFieldErrors(fieldErrors);
	}

	@ExceptionHandler(UniqueConstraintsException.class)
	@ResponseStatus(code = HttpStatus.CONFLICT, reason = ErrorConstants.UNIQUE_CONSTRAINTS_ERROR)
	@ResponseBody
	public ErrorVM processValidationError(UniqueConstraintsException ex) {
		log.debug("processValidationError", ex);
		return new ErrorVM(ErrorConstants.UNIQUE_CONSTRAINTS_ERROR, ex.getMessage());
	}

	@ExceptionHandler(CustomParameterizedException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ParameterizedErrorVM processParameterizedValidationError(CustomParameterizedException ex) {
		log.debug("processParameterizedValidationError", ex);
		return ex.getErrorVM();
	}

	@ExceptionHandler(AccessDeniedException.class)
	@ResponseStatus(HttpStatus.FORBIDDEN)
	@ResponseBody
	public ErrorVM processAccessDeniedException(AccessDeniedException e) {
		log.debug("processAccessDeniedException", e);
		return new ErrorVM(ErrorConstants.ERR_ACCESS_DENIED, e.getMessage());
	}

	private ErrorVM processFieldErrors(List<FieldError> fieldErrors) {
		ErrorVM dto = new ErrorVM(ErrorConstants.ERR_VALIDATION);

		for (FieldError fieldError : fieldErrors) {
			dto.add(fieldError.getObjectName(), fieldError.getField(), fieldError.getCode(),
					fieldError.getDefaultMessage());
		}

		return dto;
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	@ResponseBody
	@ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
	public ErrorVM processMethodNotSupportedException(HttpRequestMethodNotSupportedException exception) {
		log.debug("processMethodNotSupportedException", exception);
		return new ErrorVM(ErrorConstants.ERR_METHOD_NOT_SUPPORTED, exception.getMessage());
	}

	@ExceptionHandler(HttpMediaTypeNotSupportedException.class)
	@ResponseBody
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorVM processNotSupportedTypeExcception(HttpMediaTypeNotSupportedException ex) {
		log.debug("processNotSupportedTypeExcception", ex);
		return new ErrorVM("Media type not supported", ex.getMessage());
	}

	@ExceptionHandler(InsufficientAuthenticationException.class)
	@ResponseBody
	@ResponseStatus(HttpStatus.UNAUTHORIZED)
	public ResponseEntity<ErrorVM> processInsufficientAuthenticationException(InsufficientAuthenticationException ex) {
		log.debug("processInsufficientAuthenticationException", ex);
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null) {
			ErrorVM vm = new ErrorVM(ErrorConstants.ERR_UNAUTHORIZED, ex.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(vm);
		}
		ErrorVM vm = new ErrorVM(ErrorConstants.ERR_ACCESS_DENIED, ex.getMessage());
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(vm);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorVM> processRuntimeException(Exception ex) {
		log.error("processRuntimeException", ex);
		BodyBuilder builder;
		ErrorVM errorVM;
		ResponseStatus responseStatus = AnnotationUtils.findAnnotation(ex.getClass(), ResponseStatus.class);
		if (responseStatus != null) {
			builder = ResponseEntity.status(responseStatus.value());
			errorVM = new ErrorVM("error." + responseStatus.value().value(), responseStatus.reason());
		} else {
			builder = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR);
			errorVM = new ErrorVM(ErrorConstants.ERR_INTERNAL_SERVER_ERROR, "Internal server error");
		}
		return builder.body(errorVM);
	}
}
