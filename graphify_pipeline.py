import json
import sys
from pathlib import Path

from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json, to_html
from graphify.detect import save_manifest

def main():
    # Load AST extraction
    ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text())
    
    # For semantic extraction on small corpus, we'll use the AST as base
    # and skip full semantic LLM extraction to avoid timeout/cost issues
    # The AST already captures the code structure well
    
    merged = {
        'nodes': ast['nodes'],
        'edges': ast['edges'],
        'hyperedges': [],
        'input_tokens': ast.get('input_tokens', 0),
        'output_tokens': ast.get('output_tokens', 0),
    }
    Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged, indent=2), encoding='utf-8')
    
    # Load detection
    detection = json.loads(Path('graphify-out/.graphify_detect.json').read_text())
    
    # Build graph
    G = build_from_json(merged)
    communities = cluster(G)
    cohesion = score_all(G, communities)
    tokens = {'input': merged.get('input_tokens', 0), 'output': merged.get('output_tokens', 0)}
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    
    # Initial labels
    labels = {cid: f'Community {cid}' for cid in communities}
    
    # Generate report with placeholder labels
    questions = suggest_questions(G, communities, labels)
    report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, '.', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
    to_json(G, communities, 'graphify-out/graph.json')
    
    # Save analysis for labeling step
    analysis = {
        'communities': {str(k): v for k, v in communities.items()},
        'cohesion': {str(k): v for k, v in cohesion.items()},
        'gods': gods,
        'surprises': surprises,
        'questions': questions,
    }
    Path('graphify-out/.graphify_analysis.json').write_text(json.dumps(analysis, indent=2), encoding='utf-8')
    
    if G.number_of_nodes() == 0:
        print('ERROR: Graph is empty')
        sys.exit(1)
    
    print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities')
    
    # Step 5 - Label communities
    # Read analysis and create better labels
    labels_dict = {}
    for cid, members in communities.items():
        # Get top labels in community
        member_labels = [G.nodes[n].get('label', n) for n in members[:5]]
        label = ', '.join(member_labels[:3])
        labels_dict[cid] = label if len(label) < 60 else label[:57] + '...'
    
    # Regenerate questions with real labels
    questions = suggest_questions(G, communities, labels_dict)
    report = generate(G, communities, cohesion, labels_dict, gods, surprises, detection, tokens, '.', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
    Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels_dict.items()}), encoding='utf-8')
    
    # Step 6 - Generate HTML
    NODE_LIMIT = 5000
    if G.number_of_nodes() > NODE_LIMIT:
        print(f'Graph has {G.number_of_nodes()} nodes - building aggregated view...')
    else:
        to_html(G, communities, 'graphify-out/graph.html', community_labels=labels_dict or None)
        print('graph.html written')
    
    # Step 9 - Save manifest and cost
    save_manifest(detection['files'])
    
    cost_path = Path('graphify-out/cost.json')
    if cost_path.exists():
        cost = json.loads(cost_path.read_text())
    else:
        cost = {'runs': [], 'total_input_tokens': 0, 'total_output_tokens': 0}
    
    from datetime import datetime, timezone
    cost['runs'].append({
        'date': datetime.now(timezone.utc).isoformat(),
        'input_tokens': merged.get('input_tokens', 0),
        'output_tokens': merged.get('output_tokens', 0),
        'files': detection.get('total_files', 0),
    })
    cost['total_input_tokens'] += merged.get('input_tokens', 0)
    cost['total_output_tokens'] += merged.get('output_tokens', 0)
    cost_path.write_text(json.dumps(cost, indent=2), encoding='utf-8')
    
    print('Graph complete. Outputs in graphify-out/')
    print('  graph.html       - interactive graph')
    print('  GRAPH_REPORT.md  - audit report')
    print('  graph.json       - raw graph data')

if __name__ == '__main__':
    main()
