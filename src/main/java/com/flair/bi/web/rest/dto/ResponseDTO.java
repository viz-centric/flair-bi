package com.flair.bi.web.rest.dto;

import org.springframework.http.HttpStatus;

public class ResponseDTO {
	
	private HttpStatus status;
	private String message;
	
	public ResponseDTO(){}
	
	

	public ResponseDTO(HttpStatus status, String message) {
		super();
		this.status = status;
		this.message = message;
	}



	public HttpStatus getStatus() {
		return status;
	}

	public void setStatus(HttpStatus status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
	
	

}
