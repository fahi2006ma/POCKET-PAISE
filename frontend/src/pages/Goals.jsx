import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Coins, Calendar, CheckCircle, Clock, Trash2, Edit2, Sparkles } from 'lucide-react';
import { goalAPI } from '../api/client';
import GoalModal from '../components/GoalModal';
import GoalContributionModal from '../components/GoalContributionModal';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributionGoal, setContributionGoal] = useState(null);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const res = await goalAPI.list();
      setGoals(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await goalAPI.delete(id);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const getEmojiForIcon = (icon) => {
    switch (icon) {
      case 'Plane': return '✈️';
      case 'Shield': return '🛡️';
      case 'Laptop': return '💻';
      case 'Home': return '🏡';
      case 'Car': return '🚗';
      case 'Gift': return '🎁';
      default: return '🌟';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-800">
            Savings Goals
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Turn your financial dreams into reality with milestone tracking
          </p>
        </div>

        <button
          onClick={() => { setEditingGoal(null); setGoalModalOpen(true); }}
          className="px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:shadow cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-400 text-xs">
          Loading your savings goals...
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-12 text-center shadow-xs">
          <span className="text-4xl">🏆</span>
          <h3 className="mt-2 text-base font-bold text-stone-800">No savings goals yet</h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            Create your first goal for your next vacation, an emergency fund, or a new gadget!
          </p>
          <button
            onClick={() => { setEditingGoal(null); setGoalModalOpen(true); }}
            className="mt-4 px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
          >
            + Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const isDone = g.status === 'completed' || g.percentage >= 100;
            return (
              <div
                key={g.id}
                className="rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-2xl flex items-center justify-center shadow-xs">
                        {getEmojiForIcon(g.icon)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-stone-800">{g.name}</h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                          {g.target_date ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Target: {new Date(g.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </span>
                          ) : (
                            <span>No date limit</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingGoal(g); setGoalModalOpen(true); }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium">Saved</span>
                      <p className="text-xl font-extrabold text-emerald-800">
                        ₹{parseFloat(g.saved_amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 font-medium">Target</span>
                      <p className="text-base font-bold text-stone-800">
                        ₹{parseFloat(g.target_amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-500">{g.percentage}% achieved</span>
                      <span className="text-stone-500">
                        ₹{parseFloat(g.remaining_amount).toLocaleString('en-IN')} left
                      </span>
                    </div>
                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/60">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, g.percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : g.status === 'paused'
                        ? 'bg-stone-100 text-stone-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isDone ? 'Completed 🎉' : g.status}
                  </span>

                  <button
                    onClick={() => setContributionGoal(g)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:shadow cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-300" />
                    <span>Add Savings</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSuccess={fetchGoals}
        initialData={editingGoal}
      />

      {/* Goal Contribution Modal */}
      <GoalContributionModal
        isOpen={!!contributionGoal}
        onClose={() => setContributionGoal(null)}
        goal={contributionGoal}
        onSuccess={fetchGoals}
      />
    </div>
  );
}
