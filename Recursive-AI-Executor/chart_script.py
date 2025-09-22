# Create a simplified and cleaner system architecture diagram
diagram_code = """
flowchart TD
    User[User Input] --> React[React App with Vite]
    
    subgraph Frontend["Frontend Layer"]
        React
        Monaco[Monaco Editor]
        Tailwind[Tailwind CSS]
        PromptInput[PromptInput]
        CodeViewer[CodeViewer]
        ExecutionLog[ExecutionLog]
        StatusIndicator[StatusIndicator]
    end
    
    subgraph Backend["Backend Layer"]
        FastAPI[FastAPI Server]
        OpenAI[OpenAI API Integration]
        CodeEngine[Code Execution Engine]
        RetryManager[Retry Logic Manager]
    end
    
    subgraph Infrastructure["Infrastructure Layer"]
        Docker[Docker Containers]
        Security[Security Layers]
        FileSystem[File System Isolation]
    end
    
    %% Main data flow
    User --> React
    React --> FastAPI
    FastAPI --> OpenAI
    OpenAI --> CodeEngine
    CodeEngine --> Docker
    Docker --> RetryManager
    RetryManager --> React
    
    %% Internal connections
    React --> Monaco
    React --> PromptInput
    React --> CodeViewer
    React --> ExecutionLog
    React --> StatusIndicator
    Docker --> Security
    Security --> FileSystem
"""

# Create the mermaid diagram and save as both PNG and SVG
png_path, svg_path = create_mermaid_diagram(
    diagram_code, 
    'system_architecture_clean.png',
    'system_architecture_clean.svg',
    width=1200,
    height=800
)

print(f"Clean system architecture diagram saved as {png_path} and {svg_path}")