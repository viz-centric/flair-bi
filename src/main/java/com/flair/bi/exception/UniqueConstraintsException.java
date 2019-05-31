package com.flair.bi.exception;


public class UniqueConstraintsException extends RuntimeException {
	
	public UniqueConstraintsException(String message) {
		super(message);
	}
	
	public UniqueConstraintsException(String message,Throwable e) {
		super(message,e);
	}

}
