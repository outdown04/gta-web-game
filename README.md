# GTA Web Game (working title)

A low-poly 3D, third-person open-city action game that runs entirely in the browser. No downloads, no backend — open the page and play.

## Concept
You start as a street runner in a fictional Los Angeles-inspired city and work your way up to gang leader. Take on story missions step by step, fight rival gangs for turf, and deal with escalating police heat.

## Features
- Procedural LA-style street grid with named districts
- Drive anywhere: arcade car physics, AI traffic on road lanes
- On-foot mode with third-person camera
- Wanted system: 1–5 stars, police pursuit AI, heat cools down out of sight
- Rival gang AI (patrol / flee / fight) and a turf-control map
- Data-driven mission chain defined in JSON

## Tech stack
- Three.js (WebGL) + Vite + TypeScript
- Instanced meshes and object pooling for a stable 60fps
- Procedural low-poly assets only — no external models
- Saves in localStorage; no backend for the MVP

## Roadmap
- M1: City grid + driving + traffic
- M2: On-foot mode + police / wanted system
- M3: Mission chain + turf system
- M4: HUD, save system, polish

## Controls (planned)
- WASD move / drive, E enter & exit car, Shift run, mouse camera

## Status
Design phase. Building this with Devin as my always-on dev teammate — I drive the design and mechanics, Devin does the heavy lifting on code.
