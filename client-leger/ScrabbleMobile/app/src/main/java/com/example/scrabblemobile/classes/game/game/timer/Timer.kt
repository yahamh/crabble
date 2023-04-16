package com.example.scrabblemobile.classes.game.game.timer

import io.reactivex.rxjava3.core.Observable
import io.reactivex.rxjava3.core.Scheduler
import io.reactivex.rxjava3.disposables.Disposable
import io.reactivex.rxjava3.subjects.PublishSubject
import java.time.Instant
import java.util.concurrent.TimeUnit

class Timer {

    var isPlaying = false
    var timeLeft: Long = 0

    var timeLeftSubject: PublishSubject<Long> = PublishSubject.create()
    var timerSubject: PublishSubject<Boolean> = PublishSubject.create()

    private lateinit var timeLeftObservable: Observable<Long>
    private var timeLeftSubscription: Disposable? = null

    fun start(time: Int) {
        isPlaying = true
        timeLeft = time.toLong()
        launchObservable()
    }

    fun stop() {
        isPlaying = false
    }

    fun resume() {
        isPlaying = true
        launchObservable()
    }

    private fun launchObservable() {
        timeLeftObservable = PublishSubject.timer(100, TimeUnit.MILLISECONDS)
        if (timeLeftSubscription != null) {
            timeLeftSubscription!!.dispose()
        }
        timeLeftSubscription = timeLeftObservable.subscribe {
            if (isPlaying) {
                timeLeft -= 100
                timeLeftSubject.onNext(timeLeft)
                if (timeLeft > 0) {
                    launchObservable()
                } else {
                    timerSubject.onNext(true)
                }
            }
        }
    }

}
