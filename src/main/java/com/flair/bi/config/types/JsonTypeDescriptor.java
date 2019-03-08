package com.flair.bi.config.types;

import com.flair.bi.config.jackson.JacksonUtil;
import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.type.descriptor.java.AbstractTypeDescriptor;
import org.hibernate.type.descriptor.java.MutableMutabilityPlan;
import org.hibernate.usertype.DynamicParameterizedType;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Properties;

public class JsonTypeDescriptor extends AbstractTypeDescriptor<Object>
    implements DynamicParameterizedType {

    private Class<?> jsonObjectClass;

    public JsonTypeDescriptor() {
        super(Object.class, new MutableMutabilityPlan<Object>() {
            @Override
            protected Object deepCopyNotNull(Object value) {
                return JacksonUtil.clone(value);
            }
        });
    }

    @Override
    public String toString(Object value) {
        return JacksonUtil.toString(value);
    }

    @Override
    public Object fromString(String string) {
        return JacksonUtil.fromString(string, jsonObjectClass);
    }

    /**
     * Unwrap an instance of our handled Java type into the requested type.
     *
     * As an example, if this is a {@code JavaTypeDescriptor<Integer>} and we are asked to unwrap
     * the {@code Integer value} as a {@code Long} we would return something like
     * <code>Long.valueOf( value.longValue() )</code>.
     *
     * Intended use is during {@link PreparedStatement} binding.
     *
     * @param value   The value to unwrap
     * @param type    The type as which to unwrap
     * @param options The options
     * @return The unwrapped value.
     */
    @SuppressWarnings({"unchecked"})
    @Override
    public <X> X unwrap(Object value, Class<X> type, WrapperOptions options) {
        if (value == null) {
            return null;
        }
        if (String.class.isAssignableFrom(type)) {
            return (X) toString(value);
        }
        if (Object.class.isAssignableFrom(type)) {
            return (X) JacksonUtil.toJsonNode(toString(value));
        }
        throw unknownUnwrap(type);

    }

    /**
     * Wrap a value as our handled Java type.
     *
     * Intended use is during {@link ResultSet} extraction.
     *
     * @param value   The value to wrap.
     * @param options The options
     * @return The wrapped value.
     */
    @Override
    public <X> Object wrap(X value, WrapperOptions options) {
        if (value == null) {
            return null;
        }
        return fromString(value.toString());
    }

    /**
     * Gets called by Hibernate to pass the configured type parameters to
     * the implementation.
     *
     * @param parameters properties
     */
    @Override
    public void setParameterValues(Properties parameters) {
        jsonObjectClass = ((ParameterType) parameters.get(PARAMETER_TYPE))
            .getReturnedClass();
    }

    @Override
    public boolean areEqual(Object one, Object another) {
        if (one == another) {
            return true;
        }
        if (one == null || another == null) {
            return false;
        }
        return JacksonUtil.toJsonNode(JacksonUtil.toString(one)).equals(
            JacksonUtil.toJsonNode(JacksonUtil.toString(another)));
    }
}
