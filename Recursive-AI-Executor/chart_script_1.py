import plotly.graph_objects as go
import plotly.express as px

# Since Mermaid service is having issues, let's create the flowchart using Plotly
fig = go.Figure()

# Define positions for flowchart nodes
nodes = {
    'start': {'x': 5, 'y': 10, 'text': 'User Submits<br>Prompt', 'shape': 'oval', 'color': '#9FA8B0'},
    'ai_gen': {'x': 5, 'y': 9, 'text': 'AI Code Gen<br>(OpenAI API)', 'shape': 'rect', 'color': '#B3E5EC'},
    'ast_check': {'x': 5, 'y': 8, 'text': 'AST Validation<br>& Syntax Check', 'shape': 'rect', 'color': '#9FA8B0'},
    'security': {'x': 5, 'y': 7, 'text': 'Security Check<br>(Block dangerous)', 'shape': 'rect', 'color': '#9FA8B0'},
    'execute': {'x': 5, 'y': 6, 'text': 'Execute Code<br>in Sandbox', 'shape': 'rect', 'color': '#9FA8B0'},
    'success_check': {'x': 5, 'y': 5, 'text': 'Execution<br>Successful?', 'shape': 'diamond', 'color': '#FFEB8A'},
    'increment': {'x': 2, 'y': 4, 'text': 'Increment<br>Retry Counter', 'shape': 'rect', 'color': '#FFCDD2'},
    'max_check': {'x': 2, 'y': 3, 'text': 'Max Retries<br>Reached?', 'shape': 'diamond', 'color': '#FFEB8A'},
    'append_error': {'x': 2, 'y': 2, 'text': 'Add Error &<br>Regenerate', 'shape': 'rect', 'color': '#FFCDD2'},
    'show_results': {'x': 8, 'y': 4, 'text': 'Display Results', 'shape': 'rect', 'color': '#A5D6A7'},
    'show_error': {'x': 2, 'y': 1, 'text': 'Show Final Error', 'shape': 'rect', 'color': '#FFCDD2'},
    'end': {'x': 5, 'y': 0, 'text': 'End', 'shape': 'oval', 'color': '#9FA8B0'}
}

# Define connections (arrows)
connections = [
    ('start', 'ai_gen'),
    ('ai_gen', 'ast_check'),
    ('ast_check', 'security'),
    ('security', 'execute'),
    ('execute', 'success_check'),
    ('success_check', 'show_results', 'Yes'),
    ('success_check', 'increment', 'No'),
    ('increment', 'max_check'),
    ('max_check', 'show_error', 'Yes'),
    ('max_check', 'append_error', 'No'),
    ('append_error', 'ai_gen'),
    ('show_results', 'end'),
    ('show_error', 'end')
]

# Add arrows for connections
for conn in connections:
    from_node = nodes[conn[0]]
    to_node = nodes[conn[1]]
    label = conn[2] if len(conn) > 2 else ''
    
    fig.add_trace(go.Scatter(
        x=[from_node['x'], to_node['x']],
        y=[from_node['y'], to_node['y']],
        mode='lines',
        line=dict(color='#333333', width=2),
        showlegend=False,
        hoverinfo='skip'
    ))
    
    # Add arrowhead
    fig.add_annotation(
        x=to_node['x'],
        y=to_node['y'],
        ax=from_node['x'],
        ay=from_node['y'],
        xref='x', yref='y',
        axref='x', ayref='y',
        showarrow=True,
        arrowhead=2,
        arrowsize=1,
        arrowwidth=2,
        arrowcolor='#333333',
        text=label,
        textangle=0,
        font=dict(size=10, color='#333333'),
        bgcolor='white' if label else None,
        bordercolor='#333333' if label else None,
        borderwidth=1 if label else 0
    )

# Add nodes
for node_id, node in nodes.items():
    if node['shape'] == 'diamond':
        # Diamond shape for decisions
        fig.add_trace(go.Scatter(
            x=[node['x']-0.4, node['x'], node['x']+0.4, node['x'], node['x']-0.4],
            y=[node['y'], node['y']+0.3, node['y'], node['y']-0.3, node['y']],
            fill='toself',
            fillcolor=node['color'],
            line=dict(color='#333333', width=2),
            mode='lines',
            showlegend=False,
            hoverinfo='skip'
        ))
    elif node['shape'] == 'oval':
        # Oval shape for start/end
        fig.add_trace(go.Scatter(
            x=[node['x']],
            y=[node['y']],
            mode='markers',
            marker=dict(
                size=80,
                color=node['color'],
                line=dict(color='#333333', width=2),
                symbol='circle'
            ),
            showlegend=False,
            hoverinfo='skip'
        ))
    else:
        # Rectangle shape for processes
        fig.add_shape(
            type='rect',
            x0=node['x']-0.5, y0=node['y']-0.2,
            x1=node['x']+0.5, y1=node['y']+0.2,
            fillcolor=node['color'],
            line=dict(color='#333333', width=2)
        )
    
    # Add text label
    fig.add_annotation(
        x=node['x'],
        y=node['y'],
        text=node['text'],
        showarrow=False,
        font=dict(size=10, color='#333333'),
        align='center'
    )

# Configure layout
fig.update_layout(
    title='AI Code Execution Process Flow',
    showlegend=False,
    xaxis=dict(
        range=[0, 10],
        showgrid=False,
        showticklabels=False,
        zeroline=False
    ),
    yaxis=dict(
        range=[-1, 11],
        showgrid=False,
        showticklabels=False,
        zeroline=False
    ),
    plot_bgcolor='white',
    paper_bgcolor='white'
)

# Save the chart
fig.write_image('ai_execution_flowchart.png')
fig.write_image('ai_execution_flowchart.svg', format='svg')

print("Flowchart created successfully using Plotly")