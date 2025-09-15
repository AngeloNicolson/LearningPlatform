#include "core.hpp"
#include <algorithm>
#include <sstream>

namespace DebatePlatform {

DebateCore::DebateCore() : next_id(1) {
    // Initialize with sample topics for different categories and complexity levels
    create_topic("Climate Change", 
                 "Should governments prioritize economic growth or environmental protection?", 
                 7, "Environmental");
    create_topic("Universal Healthcare", 
                 "Should healthcare be a guaranteed government service or market-based?", 
                 6, "Healthcare");
    create_topic("Artificial Intelligence Ethics", 
                 "Should AI development be regulated or left to market forces?", 
                 8, "Technology");
    create_topic("Gun Control", 
                 "Do gun control laws reduce crime or infringe on constitutional rights?", 
                 9, "Politics");
    create_topic("Immigration Policy", 
                 "Should immigration be increased, decreased, or reformed?", 
                 7, "Politics");
    create_topic("Social Media Impact", 
                 "Does social media do more harm than good for young people?", 
                 3, "Technology");
    create_topic("School Start Times", 
                 "Should high schools start later in the morning?", 
                 2, "Education");
    create_topic("College Tuition", 
                 "Should college tuition be free or paid by students?", 
                 5, "Education");
    create_topic("Minimum Wage", 
                 "Should the minimum wage be increased or eliminated?", 
                 4, "Economics");
    create_topic("Space Exploration", 
                 "Should governments fund space exploration or focus on Earth problems?", 
                 6, "Science");
    create_topic("Animal Testing", 
                 "Is animal testing justified for medical research?", 
                 5, "Ethics");
    create_topic("Death Penalty", 
                 "Should the death penalty be abolished or maintained?", 
                 8, "Social");
}

DebateCore::~DebateCore() {}

int DebateCore::create_topic(const std::string& title, const std::string& description, 
                            int complexity, const std::string& category) {
    Topic topic;
    topic.id = next_id++;
    topic.title = title;
    topic.description = description;
    topic.complexity_level = std::max(1, std::min(10, complexity));
    topic.category = category;
    
    topics.push_back(topic);
    
    // Update search index
    std::stringstream ss(title + " " + description + " " + category);
    std::string word;
    while (ss >> word) {
        std::transform(word.begin(), word.end(), word.begin(), ::tolower);
        topic_index[word].push_back(topic.id);
    }
    
    return topic.id;
}

std::vector<Topic> DebateCore::get_topics_by_complexity(int min_level, int max_level) {
    std::vector<Topic> filtered;
    for (const auto& topic : topics) {
        if (topic.complexity_level >= min_level && topic.complexity_level <= max_level) {
            filtered.push_back(topic);
        }
    }
    return filtered;
}

std::vector<Topic> DebateCore::search_topics(const std::string& query) {
    std::vector<Topic> results;
    std::string lower_query = query;
    std::transform(lower_query.begin(), lower_query.end(), lower_query.begin(), ::tolower);
    
    for (const auto& topic : topics) {
        std::string searchable = topic.title + " " + topic.description + " " + topic.category;
        std::transform(searchable.begin(), searchable.end(), searchable.begin(), ::tolower);
        
        if (searchable.find(lower_query) != std::string::npos) {
            results.push_back(topic);
        }
    }
    return results;
}

int DebateCore::create_note(const std::string& content, const std::string& topic_tag, 
                           const std::string& type) {
    Note note;
    note.id = next_id++;
    note.content = content;
    note.topic_tag = topic_tag;
    note.note_type = type;
    note.created_at = std::chrono::system_clock::now();
    note.updated_at = note.created_at;
    
    notes.push_back(note);
    
    // Update search index
    std::stringstream ss(content + " " + topic_tag);
    std::string word;
    while (ss >> word) {
        std::transform(word.begin(), word.end(), word.begin(), ::tolower);
        note_index[word].push_back(note.id);
    }
    
    return note.id;
}

void DebateCore::link_notes(int note1_id, int note2_id) {
    for (auto& note : notes) {
        if (note.id == note1_id) {
            if (std::find(note.linked_notes.begin(), note.linked_notes.end(), note2_id) 
                == note.linked_notes.end()) {
                note.linked_notes.push_back(note2_id);
            }
        }
        if (note.id == note2_id) {
            if (std::find(note.linked_notes.begin(), note.linked_notes.end(), note1_id) 
                == note.linked_notes.end()) {
                note.linked_notes.push_back(note1_id);
            }
        }
    }
}

std::vector<Note> DebateCore::get_linked_notes(int note_id) {
    std::vector<Note> linked;
    for (const auto& note : notes) {
        if (note.id == note_id) {
            for (int linked_id : note.linked_notes) {
                for (const auto& linked_note : notes) {
                    if (linked_note.id == linked_id) {
                        linked.push_back(linked_note);
                        break;
                    }
                }
            }
            break;
        }
    }
    return linked;
}

std::vector<Note> DebateCore::search_notes(const std::string& query) {
    std::vector<Note> results;
    std::string lower_query = query;
    std::transform(lower_query.begin(), lower_query.end(), lower_query.begin(), ::tolower);
    
    for (const auto& note : notes) {
        std::string searchable = note.content + " " + note.topic_tag;
        std::transform(searchable.begin(), searchable.end(), searchable.begin(), ::tolower);
        
        if (searchable.find(lower_query) != std::string::npos) {
            results.push_back(note);
        }
    }
    return results;
}

void DebateCore::record_belief(int topic_id, int conviction, const std::string& position) {
    UserBelief belief;
    belief.topic_id = topic_id;
    belief.conviction_level = std::max(1, std::min(10, conviction));
    belief.position = position;
    belief.recorded_at = std::chrono::system_clock::now();
    
    beliefs.push_back(belief);
}

UserBelief DebateCore::get_user_belief(int topic_id) {
    // Return most recent belief for this topic
    for (auto it = beliefs.rbegin(); it != beliefs.rend(); ++it) {
        if (it->topic_id == topic_id) {
            return *it;
        }
    }
    
    // Return default if not found
    UserBelief default_belief;
    default_belief.topic_id = topic_id;
    default_belief.conviction_level = 5;
    default_belief.position = "neutral";
    default_belief.recorded_at = std::chrono::system_clock::now();
    return default_belief;
}

std::vector<UserBelief> DebateCore::get_belief_history(int topic_id) {
    std::vector<UserBelief> history;
    for (const auto& belief : beliefs) {
        if (belief.topic_id == topic_id) {
            history.push_back(belief);
        }
    }
    return history;
}

int DebateCore::create_drawing(float width, float height, const std::string& note_id) {
    Drawing drawing;
    drawing.id = next_id++;
    drawing.canvas_width = width;
    drawing.canvas_height = height;
    drawing.associated_note_id = note_id;
    
    drawings.push_back(drawing);
    return drawing.id;
}

void DebateCore::add_stroke_to_drawing(int drawing_id, const std::vector<std::pair<float, float>>& points, 
                                      float width, const std::string& color) {
    for (auto& drawing : drawings) {
        if (drawing.id == drawing_id) {
            DrawingStroke stroke;
            stroke.points = points;
            stroke.stroke_width = width;
            stroke.color = color;
            stroke.timestamp = std::chrono::system_clock::now();
            
            drawing.strokes.push_back(stroke);
            break;
        }
    }
}

Drawing DebateCore::get_drawing(int drawing_id) {
    for (const auto& drawing : drawings) {
        if (drawing.id == drawing_id) {
            return drawing;
        }
    }
    
    // Return empty drawing if not found
    Drawing empty;
    empty.id = -1;
    return empty;
}

}