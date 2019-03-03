package com.flair.bi.service.dto;

import java.util.Arrays;

import javax.validation.constraints.NotNull;

public class FileUploaderDTO {
	@NotNull
	private byte[] file;
	@NotNull
	private String fileSystem;
	@NotNull
	private String fileName;
	private String contentType;
	
	public FileUploaderDTO(){}

	public byte[] getFile() {
		return file;
	}

	public void setFile(byte[] file) {
		this.file = file;
	}

	public String getFileSystem() {
		return fileSystem;
	}

	public void setFileSystem(String fileSystem) {
		this.fileSystem = fileSystem;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	@Override
	public String toString() {
		return "FileUploaderDTO [file=" + Arrays.toString(file) + ", fileSystem=" + fileSystem + ", fileName="
				+ fileName + ", contentType=" + contentType + "]";
	}
	
}
