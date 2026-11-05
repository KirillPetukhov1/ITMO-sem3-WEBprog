package itmo.web.students.config;

import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.*;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.parameters.RequestBody;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import itmo.web.students.error.ApiError;
import itmo.web.students.student.dto.StudentSearchRequest;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI openAPI() {
        return new OpenAPI().info(new Info().title("Students API").version("1.0.0")
                        .description("REST API лаб 3"))
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    @Bean
    OpenApiCustomizer contractDocumentation() {
        return api -> {
            ModelConverters.getInstance().readAll(StudentSearchRequest.class).forEach(api.getComponents()::addSchemas);
            ModelConverters.getInstance().readAll(ApiError.class).forEach(api.getComponents()::addSchemas);
            api.getPaths().remove("/error");
            PathItem students = api.getPaths().get("/api/students");
            if (students == null) return;
            var queryResponses = new ApiResponses().addApiResponse("200", new ApiResponse().description("Страница студентов")
                    .content(new Content().addMediaType("application/json", new MediaType().schema(new Schema<>().$ref("#/components/schemas/StudentPageResponse")))));
            var operation = new Operation().operationId("queryStudents").summary("Поиск студентов через JSON-тело")
                    .addTagsItem("student-controller").addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                    .requestBody(new RequestBody().required(true).content(new Content().addMediaType("application/json",
                            new MediaType().schema(new Schema<>().$ref("#/components/schemas/StudentSearchRequest"))
                                    .example(Map.of("group", "M3301", "isForeigner", false, "page", 1, "page_size", 10)))))
                    .responses(queryResponses);
            students.addExtension("x-oai-additionalOperations", Map.of("QUERY", operation));
            if (students.getGet() != null) {
                students.getGet().setParameters(new ArrayList<>());
                for (String name : List.of("fullName", "group", "isuId", "dormitory", "room", "settlementDate", "isForeigner", "notes", "sortBy", "order", "page", "page_size")) {
                    Schema<?> schema = Set.of("isuId", "dormitory", "room", "page", "page_size").contains(name) ? new IntegerSchema() : new StringSchema();
                    if (name.equals("settlementDate")) schema = new DateSchema();
                    students.getGet().addParametersItem(new Parameter().name(name).in("query").required(false).schema(schema));
                }
            }
            List<Operation> operations = new ArrayList<>();
            api.getPaths().values().forEach(path -> operations.addAll(path.readOperations()));
            operations.add(operation);
            for (Operation op : operations) {
                if (op.getResponses() == null) op.setResponses(new ApiResponses());
                for (String status : List.of("400", "401", "403", "404", "409", "422", "500")) {
                    op.getResponses().addApiResponse(status, new ApiResponse().description("Ошибка API; code, message, details")
                            .content(new Content().addMediaType("application/json", new MediaType().schema(new Schema<>().$ref("#/components/schemas/ApiError")))));
                }
            }
        };
    }
}
