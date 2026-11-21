import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Circle, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Clock, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatRuntime, formatYear } from '../../utils/formatters';

export default function RewatchDagGraph({
  movies = [], // Prerequisite movies from backend in topological order
  targetMovie = null, // The target movie object
  allMovies = [], // Full movies catalog for resolving relations
  onToggleWatched,
  isUpdating,
}) {
  const [zoom, setZoom] = useState(1);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Combine target movie with prerequisites into a unified subgraph
  const fullSubgraph = useMemo(() => {
    if (!targetMovie) return movies;
    // Ensure targetMovie is included as the terminal node
    const exists = movies.some((m) => m.id === targetMovie.id);
    if (!exists) {
      // Find full target object from allMovies if available for its prereqs
      const fullTarget = allMovies.find((m) => m.id === targetMovie.id) || targetMovie;
      return [...movies, { ...fullTarget, isTarget: true }];
    }
    return movies.map((m) => m.id === targetMovie.id ? { ...m, isTarget: true } : m);
  }, [movies, targetMovie, allMovies]);

  // Compute graph levels (topological depth) for each node
  const { nodePositions, edges, levelsCount, maxNodesPerLevel, svgWidth, svgHeight } = useMemo(() => {
    const subgraphIds = new Set(fullSubgraph.map((m) => m.id));
    
    // Resolve prerequisite IDs for each movie within the subgraph
    const prereqsMap = new Map();
    fullSubgraph.forEach((m) => {
      const fullObj = allMovies.find((item) => item.id === m.id) || m;
      const rawPrereqs = fullObj.prerequisites || [];
      // Only keep prerequisites that belong to this subgraph
      const validPrereqs = rawPrereqs.filter((id) => subgraphIds.has(id));
      prereqsMap.set(m.id, validPrereqs);
    });

    // Target movie explicitly depends on all movies in the subgraph that are its direct prereqs,
    // or if not specified, on the terminal nodes of the rewatch order
    if (targetMovie) {
      const targetPrereqs = prereqsMap.get(targetMovie.id) || [];
      if (targetPrereqs.length === 0 && movies.length > 0) {
        // Fallback: connect last movie(s) to target
        const lastMovie = movies[movies.length - 1];
        prereqsMap.set(targetMovie.id, [lastMovie.id]);
      }
    }

    // Compute levels using dynamic programming / longest path
    const levelMap = new Map();

    const getLevel = (id, visited = new Set()) => {
      if (levelMap.has(id)) return levelMap.get(id);
      if (visited.has(id)) return 0; // prevent cycle recursion
      visited.add(id);

      const prereqs = prereqsMap.get(id) || [];
      if (prereqs.length === 0) {
        levelMap.set(id, 0);
        return 0;
      }

      let maxPrereqLevel = 0;
      for (const pId of prereqs) {
        maxPrereqLevel = Math.max(maxPrereqLevel, getLevel(pId, new Set(visited)));
      }

      const calculatedLevel = maxPrereqLevel + 1;
      levelMap.set(id, calculatedLevel);
      return calculatedLevel;
    };

    fullSubgraph.forEach((m) => getLevel(m.id));

    // Ensure target movie is at the maximum level column
    if (targetMovie) {
      let maxNonTargetLevel = -1;
      fullSubgraph.forEach((m) => {
        if (m.id !== targetMovie.id) {
          maxNonTargetLevel = Math.max(maxNonTargetLevel, levelMap.get(m.id) || 0);
        }
      });
      levelMap.set(targetMovie.id, maxNonTargetLevel + 1);
    }

    // Group nodes by level
    const levelColumns = new Map();
    fullSubgraph.forEach((m) => {
      const lvl = levelMap.get(m.id) || 0;
      if (!levelColumns.has(lvl)) {
        levelColumns.set(lvl, []);
      }
      levelColumns.get(lvl).push(m);
    });

    // Layout configuration constants
    const nodeWidth = 220;
    const nodeHeight = 84;
    const colGap = 100;
    const rowGap = 36;
    const paddingX = 40;
    const paddingY = 40;

    const sortedLevels = Array.from(levelColumns.keys()).sort((a, b) => a - b);
    const levelsCount = sortedLevels.length || 1;
    let maxNodesPerLevel = 1;

    sortedLevels.forEach((lvl) => {
      const count = levelColumns.get(lvl).length;
      if (count > maxNodesPerLevel) maxNodesPerLevel = count;
    });

    const totalHeight = Math.max(
      maxNodesPerLevel * nodeHeight + (maxNodesPerLevel - 1) * rowGap + paddingY * 2,
      280
    );
    const totalWidth = levelsCount * nodeWidth + (levelsCount - 1) * colGap + paddingX * 2;

    // Calculate (x, y) coordinates for each node
    const positions = new Map();

    sortedLevels.forEach((lvl, colIndex) => {
      const colNodes = levelColumns.get(lvl);
      const colHeight = colNodes.length * nodeHeight + (colNodes.length - 1) * rowGap;
      const startY = (totalHeight - colHeight) / 2;
      const x = paddingX + colIndex * (nodeWidth + colGap);

      colNodes.forEach((node, rowIndex) => {
        const y = startY + rowIndex * (nodeHeight + rowGap);
        positions.set(node.id, {
          x,
          y,
          width: nodeWidth,
          height: nodeHeight,
          node,
          level: lvl,
        });
      });
    });

    // Build directed edges (prerequisite -> dependent)
    const edgeList = [];
    prereqsMap.forEach((prereqIds, dependentId) => {
      const dependentPos = positions.get(dependentId);
      if (!dependentPos) return;

      prereqIds.forEach((prereqId) => {
        const prereqPos = positions.get(prereqId);
        if (!prereqPos) return;

        edgeList.push({
          id: `${prereqId}->${dependentId}`,
          fromId: prereqId,
          toId: dependentId,
          fromPos: prereqPos,
          toPos: dependentPos,
          isWatched: Boolean(prereqPos.node.watched),
        });
      });
    });

    return {
      nodePositions: positions,
      edges: edgeList,
      levelsCount,
      maxNodesPerLevel,
      svgWidth: totalWidth,
      svgHeight: totalHeight,
    };
  }, [fullSubgraph, targetMovie, allMovies]);

  // Check if edge should be highlighted based on hovered node
  const isEdgeHighlighted = (edge) => {
    if (!hoveredNodeId) return false;
    return edge.fromId === hoveredNodeId || edge.toId === hoveredNodeId;
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="relative border border-charcoal-200 rounded-xl bg-charcoal-50/40 overflow-hidden shadow-card">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-charcoal-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Topological Prerequisite DAG
          </span>
          <span className="text-charcoal-400 hidden sm:inline">•</span>
          <span className="text-charcoal-500 hidden sm:inline">
            Directed arrows flow from prerequisite story to target movie
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-charcoal-100 rounded-lg p-0.5 border border-charcoal-200">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded text-charcoal-600 hover:text-charcoal-900 hover:bg-white transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-semibold text-charcoal-600 px-1 min-w-10 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded text-charcoal-600 hover:text-charcoal-900 hover:bg-white transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 rounded text-charcoal-600 hover:text-charcoal-900 hover:bg-white transition-colors border-l border-charcoal-200 ml-0.5"
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Graph Viewport */}
      <div className="overflow-auto max-h-[580px] p-6 flex items-center justify-center cursor-grab active:cursor-grabbing">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
            width: `${svgWidth}px`,
            height: `${svgHeight}px`,
          }}
          className="relative select-none"
        >
          {/* SVG Canvas for Connectors */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            <defs>
              {/* Arrowhead marker: Default unwatched */}
              <marker
                id="dag-arrow-default"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#A3A3A3" />
              </marker>

              {/* Arrowhead marker: Watched (Green) */}
              <marker
                id="dag-arrow-watched"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#16A34A" />
              </marker>

              {/* Arrowhead marker: Active / Highlighted (Orange) */}
              <marker
                id="dag-arrow-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#E85D3F" />
              </marker>
            </defs>

            {/* Render directed bezier paths */}
            {edges.map((edge) => {
              const startX = edge.fromPos.x + edge.fromPos.width;
              const startY = edge.fromPos.y + edge.fromPos.height / 2;
              const endX = edge.toPos.x;
              const endY = edge.toPos.y + edge.toPos.height / 2;

              const dx = (endX - startX) * 0.55;
              const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

              const isHighlighted = isEdgeHighlighted(edge);
              let strokeColor = '#D4D4D4';
              let markerEnd = 'url(#dag-arrow-default)';

              if (isHighlighted) {
                strokeColor = '#E85D3F';
                markerEnd = 'url(#dag-arrow-active)';
              } else if (edge.isWatched) {
                strokeColor = '#86EFAC';
                markerEnd = 'url(#dag-arrow-watched)';
              }

              return (
                <g key={edge.id}>
                  {/* Outer glow line for highlighted paths */}
                  {isHighlighted && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#FEE2E2"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  )}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 2.5 : 2}
                    strokeDasharray={edge.isWatched || isHighlighted ? 'none' : '4 4'}
                    markerEnd={markerEnd}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>

          {/* Render Graph Nodes */}
          {Array.from(nodePositions.values()).map(({ node, x, y, width, height, level }) => {
            const isTarget = Boolean(node.isTarget);
            const isWatched = Boolean(node.watched);
            const isHovered = hoveredNodeId === node.id;

            return (
              <motion.div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                className={`rounded-xl p-3 border transition-all flex flex-col justify-between shadow-card ${
                  isTarget
                    ? 'bg-white border-primary shadow-elevated ring-2 ring-primary/20'
                    : isWatched
                    ? 'bg-status-successBg/40 border-status-success/30 hover:border-status-success/60'
                    : 'bg-white border-charcoal-200 hover:border-charcoal-400'
                } ${isHovered ? 'ring-2 ring-primary/40' : ''}`}
              >
                {/* Node Header */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isTarget
                          ? 'bg-primary text-white'
                          : isWatched
                          ? 'bg-status-success text-white'
                          : 'bg-charcoal-100 text-charcoal-600'
                      }`}
                    >
                      {isTarget ? 'Target' : `Layer ${level + 1}`}
                    </span>
                    <h4
                      className={`text-xs font-bold truncate ${
                        isWatched && !isTarget
                          ? 'text-charcoal-600 line-through decoration-charcoal-400'
                          : 'text-charcoal-900'
                      }`}
                      title={node.title}
                    >
                      {node.title}
                    </h4>
                  </div>

                  {/* Watched Status Indicator Button */}
                  {!isTarget && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatched(node.id, isWatched);
                      }}
                      className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isWatched
                          ? 'bg-status-success text-white hover:bg-green-700'
                          : 'border border-charcoal-300 text-charcoal-400 hover:border-primary hover:text-primary bg-white'
                      }`}
                      title={isWatched ? 'Mark unwatched' : 'Mark watched'}
                    >
                      {isWatched ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Circle className="w-2.5 h-2.5" />}
                    </button>
                  )}
                </div>

                {/* Node Footer Metadata */}
                <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1 border-t border-charcoal-100">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-charcoal-400" />
                      {formatYear(node.release_year)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-charcoal-400" />
                      {formatRuntime(node.runtime)}
                    </span>
                  </div>

                  {isTarget ? (
                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                      Goal
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-medium ${
                        isWatched ? 'text-status-success' : 'text-charcoal-400'
                      }`}
                    >
                      {isWatched ? 'Done' : 'Pending'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="px-4 py-2 bg-charcoal-50 border-t border-charcoal-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-charcoal-500">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
            <span>Watched Movie (Prerequisite Met)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-charcoal-300 border border-charcoal-400" />
            <span>Unwatched Movie</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Target Destination</span>
          </div>
        </div>
        <span className="text-charcoal-400 italic">
          Click the checkmark icon on any card to toggle watched status directly in graph
        </span>
      </div>
    </div>
  );
}
