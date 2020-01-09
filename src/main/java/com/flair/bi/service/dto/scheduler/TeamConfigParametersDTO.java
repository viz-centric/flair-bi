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
public class TeamConfigParametersDTO {
	private Integer id;
    private String webhookName;
    private String webhookURL;
}
