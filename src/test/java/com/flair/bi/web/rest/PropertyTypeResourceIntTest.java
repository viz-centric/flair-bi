package com.flair.bi.web.rest;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import javax.inject.Inject;

import com.flair.bi.AbstractIntegrationTest;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.querydsl.QuerydslPredicateArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import com.flair.bi.FlairbiApp;
import com.flair.bi.domain.enumeration.InputType;
import com.flair.bi.domain.propertytype.CheckboxPropertyType;
import com.flair.bi.domain.propertytype.ColorPickerPropertyType;
import com.flair.bi.domain.propertytype.NumberPropertyType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.domain.propertytype.SelectPropertyType;
import com.flair.bi.domain.propertytype.TextPropertyType;
import com.flair.bi.service.dto.PropertyTypeDTO;
import com.flair.bi.service.mapper.PropertyTypeMapper;
import com.flair.bi.service.properttype.PropertyTypeService;

public class PropertyTypeResourceIntTest extends AbstractIntegrationTest {

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;
    
    @Inject
    private QuerydslPredicateArgumentResolver querydslPredicateArgumentResolver;
    
    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;
   
    private MockMvc restPropertyTypeMockMvc;
    
    @Inject
    private  PropertyTypeService propertyTypeService;

    @Inject
    private PropertyTypeMapper propertyTypeMapper;
    
    private static final String NAME = "AAAAA";
    
    private static final String INPUT_TYPE = "TEXT";
    
    private static final String DESCRIPTION = "XYZ";
    
    private static final String UPDATED_NAME = "BBBB";
    
    private static final String UPDATED_INPUT_TYPE = "CHECKBOX";
    
    private static final String UPDATED_DESCRIPTION = "ABC";
    
    private static final String UPDATE_ACTION = "UPDATE";
    
    private static final String ADD_ACTION = "ADD";
   
    
    
    
    private PropertyTypeDTO propertyTypeDTO;
    
    
    public PropertyType  createEntity() {
    	propertyTypeDTO= new PropertyTypeDTO();
    	propertyTypeDTO.setName(NAME);
    	propertyTypeDTO.setDescription(DESCRIPTION);
    	propertyTypeDTO.setInputType(INPUT_TYPE);
		return propertyTypeDTOToPropertyType(propertyTypeDTO,ADD_ACTION);
    }
    
    public PropertyType  updateEntity(long id) {
    	propertyTypeDTO= new PropertyTypeDTO();
    	propertyTypeDTO.setId(id);
    	propertyTypeDTO.setName(UPDATED_NAME);
    	propertyTypeDTO.setDescription(UPDATED_DESCRIPTION);
    	propertyTypeDTO.setInputType(UPDATED_INPUT_TYPE);
		return propertyTypeDTOToPropertyType(propertyTypeDTO,UPDATE_ACTION);
    }
    
    private PropertyType propertyTypeDTOToPropertyType(PropertyTypeDTO propertyTypeDTO,String action) {
        PropertyType propertyType;
        if(action.equals(UPDATE_ACTION)){
        	propertyType = new CheckboxPropertyType();
        	propertyType.setId(propertyTypeDTO.getId());
        }else{
        	propertyType = new TextPropertyType();
        }
        propertyType.setDescription(propertyTypeDTO.getDescription());
        propertyType.setName(propertyTypeDTO.getName());
        propertyType.setType(propertyTypeDTO.getInputType());

        return propertyType;
    }
    
    @Before
    public void setup() {
    	PropertyTypeResource PropertyTypeResource = new PropertyTypeResource( propertyTypeService, propertyTypeMapper);  
        this.restPropertyTypeMockMvc = MockMvcBuilders.standaloneSetup(PropertyTypeResource)
                .setCustomArgumentResolvers(pageableArgumentResolver, querydslPredicateArgumentResolver)
                .setMessageConverters(jacksonMessageConverter).build();
    }
        
    
    @Test
    @Transactional
    public void getAllPropertyTypes() throws Exception {
    	PropertyType propertyType =propertyTypeService.save(createEntity());
    	restPropertyTypeMockMvc.perform(get("/api/propertyTypes?sort=id,desc&page=0&size=1"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
        .andExpect(jsonPath("$.[*].name").value(hasItem(propertyType.getName())))
    	.andExpect(jsonPath("$.[*].description").value(hasItem(propertyType.getDescription())))
    	.andExpect(jsonPath("$.[*].inputType").value(hasItem(propertyType.getType())))
    	.andExpect(jsonPath("$.[*].id").value(hasItem(propertyType.getId().intValue())));
        
    }
    
    
    @Test
    @Transactional
    public void getPropertyTypes() throws Exception {
    	PropertyType propertyType =propertyTypeService.save(createEntity());
    	restPropertyTypeMockMvc.perform(get("/api/propertyTypes/{id}",propertyType.getId()))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
        .andExpect(jsonPath("$.id").value(propertyType.getId()))
        .andExpect(jsonPath("$.name").value(propertyType.getName()))
        .andExpect(jsonPath("$.description").value(propertyType.getDescription()))
        .andExpect(jsonPath("$.type").value(propertyType.getType()));
    	
    }
    
    @Test
    @Transactional
    public void createPropertyTypes() throws Exception {
    	restPropertyTypeMockMvc.perform(post("/api/propertyTypes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(createEntity())))
        		.andExpect(status().isCreated())
		        .andExpect(jsonPath("$.name").value(NAME))
		        .andExpect(jsonPath("$.description").value(DESCRIPTION))
		        .andExpect(jsonPath("$.type").value(INPUT_TYPE));
    	
    }
    
    @Test
    @Transactional
    public void updatePropertyTypes() throws Exception {
    	PropertyType propertyType =propertyTypeService.save(createEntity());
    	restPropertyTypeMockMvc.perform(put("/api/propertyTypes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(updateEntity(propertyType.getId()))))
    	 		.andExpect(status().isOk())
		        .andExpect(jsonPath("$.name").value(UPDATED_NAME))
		        .andExpect(jsonPath("$.description").value(UPDATED_DESCRIPTION))
		        .andExpect(jsonPath("$.type").value(UPDATED_INPUT_TYPE));
    	
    }
    
    @Test
    @Transactional
    public void deletePropertyTypes() throws Exception {
    	PropertyType propertyType =propertyTypeService.save(createEntity());
    	restPropertyTypeMockMvc.perform(delete("/api/propertyTypes/{id}",propertyType.getId()))
        .andExpect(status().isOk());
    	
    }
}
