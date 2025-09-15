#include "core.hpp"
#include <emscripten/bind.h>
#include <emscripten/val.h>

using namespace emscripten;
using namespace DebatePlatform;

// Global instance
static DebateCore* g_core = nullptr;

// Initialize the core
void init_core() {
    if (!g_core) {
        g_core = new DebateCore();
    }
}

// Topic functions
int create_topic(const std::string& title, const std::string& description, 
                int complexity, const std::string& category) {
    if (!g_core) init_core();
    return g_core->create_topic(title, description, complexity, category);
}

val get_topics_by_complexity(int min_level, int max_level) {
    if (!g_core) init_core();
    auto topics = g_core->get_topics_by_complexity(min_level, max_level);
    
    val result = val::array();
    for (size_t i = 0; i < topics.size(); ++i) {
        val topic = val::object();
        topic.set("id", topics[i].id);
        topic.set("title", topics[i].title);
        topic.set("description", topics[i].description);
        topic.set("complexity_level", topics[i].complexity_level);
        topic.set("category", topics[i].category);
        result.call<void>("push", topic);
    }
    return result;
}

val search_topics(const std::string& query) {
    if (!g_core) init_core();
    auto topics = g_core->search_topics(query);
    
    val result = val::array();
    for (size_t i = 0; i < topics.size(); ++i) {
        val topic = val::object();
        topic.set("id", topics[i].id);
        topic.set("title", topics[i].title);
        topic.set("description", topics[i].description);
        topic.set("complexity_level", topics[i].complexity_level);
        topic.set("category", topics[i].category);
        result.call<void>("push", topic);
    }
    return result;
}

// Note functions
int create_note(const std::string& content, const std::string& topic_tag, const std::string& type) {
    if (!g_core) init_core();
    return g_core->create_note(content, topic_tag, type);
}

void link_notes(int note1_id, int note2_id) {
    if (!g_core) init_core();
    g_core->link_notes(note1_id, note2_id);
}

val get_linked_notes(int note_id) {
    if (!g_core) init_core();
    auto notes = g_core->get_linked_notes(note_id);
    
    val result = val::array();
    for (size_t i = 0; i < notes.size(); ++i) {
        val note = val::object();
        note.set("id", notes[i].id);
        note.set("content", notes[i].content);
        note.set("topic_tag", notes[i].topic_tag);
        note.set("note_type", notes[i].note_type);
        result.call<void>("push", note);
    }
    return result;
}

val search_notes(const std::string& query) {
    if (!g_core) init_core();
    auto notes = g_core->search_notes(query);
    
    val result = val::array();
    for (size_t i = 0; i < notes.size(); ++i) {
        val note = val::object();
        note.set("id", notes[i].id);
        note.set("content", notes[i].content);
        note.set("topic_tag", notes[i].topic_tag);
        note.set("note_type", notes[i].note_type);
        result.call<void>("push", note);
    }
    return result;
}

// Belief tracking functions
void record_belief(int topic_id, int conviction, const std::string& position) {
    if (!g_core) init_core();
    g_core->record_belief(topic_id, conviction, position);
}

val get_user_belief(int topic_id) {
    if (!g_core) init_core();
    auto belief = g_core->get_user_belief(topic_id);
    
    val result = val::object();
    result.set("topic_id", belief.topic_id);
    result.set("conviction_level", belief.conviction_level);
    result.set("position", belief.position);
    return result;
}

// Drawing functions
int create_drawing(float width, float height, const std::string& note_id) {
    if (!g_core) init_core();
    return g_core->create_drawing(width, height, note_id);
}

void add_stroke_to_drawing(int drawing_id, val points_array, float width, const std::string& color) {
    if (!g_core) init_core();
    
    std::vector<std::pair<float, float>> points;
    int length = points_array["length"].as<int>();
    
    for (int i = 0; i < length; ++i) {
        val point = points_array[i];
        float x = point["x"].as<float>();
        float y = point["y"].as<float>();
        points.push_back({x, y});
    }
    
    g_core->add_stroke_to_drawing(drawing_id, points, width, color);
}

val get_drawing(int drawing_id) {
    if (!g_core) init_core();
    auto drawing = g_core->get_drawing(drawing_id);
    
    val result = val::object();
    result.set("id", drawing.id);
    result.set("canvas_width", drawing.canvas_width);
    result.set("canvas_height", drawing.canvas_height);
    result.set("associated_note_id", drawing.associated_note_id);
    
    val strokes = val::array();
    for (size_t i = 0; i < drawing.strokes.size(); ++i) {
        val stroke = val::object();
        stroke.set("stroke_width", drawing.strokes[i].stroke_width);
        stroke.set("color", drawing.strokes[i].color);
        
        val points = val::array();
        for (size_t j = 0; j < drawing.strokes[i].points.size(); ++j) {
            val point = val::object();
            point.set("x", drawing.strokes[i].points[j].first);
            point.set("y", drawing.strokes[i].points[j].second);
            points.call<void>("push", point);
        }
        stroke.set("points", points);
        
        strokes.call<void>("push", stroke);
    }
    result.set("strokes", strokes);
    
    return result;
}

// Emscripten bindings
EMSCRIPTEN_BINDINGS(debate_platform) {
    function("init_core", &init_core);
    
    // Topic functions
    function("create_topic", &create_topic);
    function("get_topics_by_complexity", &get_topics_by_complexity);
    function("search_topics", &search_topics);
    
    // Note functions
    function("create_note", &create_note);
    function("link_notes", &link_notes);
    function("get_linked_notes", &get_linked_notes);
    function("search_notes", &search_notes);
    
    // Belief functions
    function("record_belief", &record_belief);
    function("get_user_belief", &get_user_belief);
    
    // Drawing functions
    function("create_drawing", &create_drawing);
    function("add_stroke_to_drawing", &add_stroke_to_drawing);
    function("get_drawing", &get_drawing);
}