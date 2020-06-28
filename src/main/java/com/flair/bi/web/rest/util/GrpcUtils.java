package com.flair.bi.web.rest.util;

public class GrpcUtils {
	public static String orEmpty(String value) {
		if (value == null) {
			return "";
		}
		return value;
	}
}
