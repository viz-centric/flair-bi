package com.flair.bi.service;
import java.io.File;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

import com.flair.bi.web.rest.DashboardsResource;

import java.io.*;

@Service
@Slf4j
public class FileUploadService {
	
	
    @Value("${image-location}")
    private String imageLocation;
    
	@Value("${storage-data-files}")
	private String storageDataFiles;
    
	public String uploadedImageAndReturnPath(byte[] content, Long id,String contentType,String type) throws Exception{
		
		String path = null;
		
		File f = null;
		OutputStream os = null;
		try {
			
			path = imageLocation+type+id+"."+contentType;
			File dir = new File(imageLocation);
			if(!dir.exists()) {
				dir.mkdirs();
			}
			
			// creating the file and writing the stream
			f = new File(path);
			os = new FileOutputStream(f);
			os.write(content);						
		
		} catch (IOException e) {
			path = null;
			log.error("error occured while uploading file  : {}",e.getMessage());
		} catch (Exception e) {
			path = null;
			log.error("error occured while uploading file  : {}",e.getMessage());
		} finally {
			try {
				if(os != null)
					os.close();
				f = null;
			} catch (IOException e) {
				
			}
		}
		return path;
	}
	
	public String uploadedCSVFile(byte[] content,String contentType,String fileName,String folderName) throws Exception{
		
		String path = null;
		
		File f = null;
		OutputStream os = null;
		try {
			path = getFilePath(fileName,folderName);
			File dir = new File(getDirectory(folderName));
			if(!dir.exists()) {
				dir.mkdirs();
			}
			f = new File(path);
			os = new FileOutputStream(f);
			os.write(content);
		} catch (IOException e) {
			path = null;
			log.error("error occured while uploading file  : {}",e.getMessage());
			throw new Exception("error occured while uploading file  : "+e.getMessage());
		} catch (Exception e) {
			path = null;
			log.error("error occured while uploading file  : {}",e.getMessage());
			throw new Exception("error occured while uploading file  : "+e.getMessage());
		} finally {
			try {
				if(os != null)
					os.close();
				f = null;
			} catch (IOException e) {
				
			}
		}
		return path;
	}
	
	public void deleteImage(String imageLocation) {
		try {
			File file = new File(imageLocation);
			if (!file.delete()) {
				log.error("error occured while deleting file : ", imageLocation);
			}
		} catch (Exception e) {
			log.error("error occured while deleting file : ", e.getMessage());
		}

	}
	
	
	private String getFilePath(String fileName,String folderName){
		return storageDataFiles+folderName+"/"+fileName+"."+"csv";
	}
	
	private String getDirectory(String folderName){
		return storageDataFiles+folderName+"/";
	}
	

}
