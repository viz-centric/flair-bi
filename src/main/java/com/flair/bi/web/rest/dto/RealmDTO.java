package com.flair.bi.web.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RealmDTO {
    private Long id;
    private String name;

    public static RealmDTOBuilder builder() {
        return new RealmDTOBuilder();
    }

    public static class RealmDTOBuilder {
        private Long id;
        private String name;

        RealmDTOBuilder() {
        }

        public RealmDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public RealmDTOBuilder name(String name) {
            this.name = name;
            return this;
        }

        public RealmDTO build() {
            return new RealmDTO(id, name);
        }

        public String toString() {
            return "RealmDTO.RealmDTOBuilder(id=" + this.id + ", name=" + this.name + ")";
        }
    }
}
