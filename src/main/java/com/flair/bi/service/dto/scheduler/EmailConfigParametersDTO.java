package com.flair.bi.service.dto.scheduler;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class EmailConfigParametersDTO {
	private Integer id;
    private String host;
    private String sender;
    private Integer port; 
    private String user;
    private String password;
}
