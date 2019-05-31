package com.flair.bi.exception;

public class UniqueConstraintsException extends Exception {
	
	public UniqueConstraintsException(String message) {
		super(message);
	}
	
	public UniqueConstraintsException(String message,Throwable e) {
		super(message,e);
	}

}
