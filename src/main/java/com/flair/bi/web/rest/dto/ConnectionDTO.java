package com.flair.bi.web.rest.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Map;

@Data
@Accessors(chain = true)
public class ConnectionDTO {
    private Long id;
    private String name;
    private String connectionUsername;
    private String connectionPassword;
    private Long connectionTypeId;
    private String linkId;
    private Map<String, String> details;
    private Map<String, String> connectionParameters;

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("ConnectionDTO{");
        sb.append("id=").append(id);
        sb.append(", name='").append(name).append('\'');
        sb.append(", connectionUsername='").append("***").append('\'');
        sb.append(", connectionPassword='").append("***").append('\'');
        sb.append(", connectionTypeId=").append(connectionTypeId);
        sb.append(", linkId='").append(linkId).append('\'');
        sb.append(", details=").append(details);
        sb.append(", connectionParameters=").append(connectionParameters);
        sb.append('}');
        return sb.toString();
    }
}
