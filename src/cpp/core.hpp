#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <chrono>

namespace DebatePlatform {

struct Topic {
    int id;
    std::string title;
    std::string description;
    int complexity_level;  // 1-10
    std::string category;
    std::vector<std::string> tags;
};

struct Note {
    int id;
    std::string content;
    std::string topic_tag;
    std::chrono::system_clock::time_point created_at;
    std::chrono::system_clock::time_point updated_at;
    std::vector<int> linked_notes;  // bidirectional links
    std::string note_type;  // "claim", "evidence", "rebuttal", "general"
};

struct UserBelief {
    int topic_id;
    int conviction_level;  // 1-10 how strongly they believe
    std::string position;   // "for", "against", "neutral"
    std::chrono::system_clock::time_point recorded_at;
};

struct DrawingStroke {
    std::vector<std::pair<float, float>> points;
    float stroke_width;
    std::string color;
    std::chrono::system_clock::time_point timestamp;
};

struct Drawing {
    int id;
    std::vector<DrawingStroke> strokes;
    float canvas_width;
    float canvas_height;
    std::string associated_note_id;
};

class DebateCore {
public:
    DebateCore();
    ~DebateCore();

    // Topic management
    int create_topic(const std::string& title, const std::string& description, 
                    int complexity, const std::string& category);
    std::vector<Topic> get_topics_by_complexity(int min_level, int max_level);
    std::vector<Topic> search_topics(const std::string& query);
    
    // Note system
    int create_note(const std::string& content, const std::string& topic_tag, 
                   const std::string& type = "general");
    void link_notes(int note1_id, int note2_id);
    std::vector<Note> get_linked_notes(int note_id);
    std::vector<Note> search_notes(const std::string& query);
    
    // Belief tracking
    void record_belief(int topic_id, int conviction, const std::string& position);
    UserBelief get_user_belief(int topic_id);
    std::vector<UserBelief> get_belief_history(int topic_id);
    
    // Drawing system
    int create_drawing(float width, float height, const std::string& note_id = "");
    void add_stroke_to_drawing(int drawing_id, const std::vector<std::pair<float, float>>& points, 
                              float width, const std::string& color);
    Drawing get_drawing(int drawing_id);
    
private:
    std::vector<Topic> topics;
    std::vector<Note> notes;
    std::vector<UserBelief> beliefs;
    std::vector<Drawing> drawings;
    int next_id;
    
    // Search index for fast lookups
    std::unordered_map<std::string, std::vector<int>> topic_index;
    std::unordered_map<std::string, std::vector<int>> note_index;
};

}